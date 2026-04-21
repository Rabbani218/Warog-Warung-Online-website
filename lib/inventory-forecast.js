import { prisma } from "@/lib/prisma";

export async function calculateInventoryForecast(storeId, lookbackDays = 7) {
  const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

  const [orders, ingredients] = await Promise.all([
    prisma.order.findMany({
      where: {
        storeId,
        status: { in: ["PAID", "PROCESSING", "COMPLETED"] },
        createdAt: { gte: since }
      },
      include: {
        details: {
          include: {
            menu: {
              include: {
                recipes: {
                  include: {
                    ingredient: true
                  }
                }
              }
            }
          }
        }
      }
    }),
    prisma.ingredient.findMany({
      where: { storeId },
      orderBy: { name: "asc" }
    })
  ]);

  const usageByIngredient = new Map();

  for (const order of orders) {
    for (const detail of order.details) {
      const qty = Number(detail.quantity || 0);
      for (const recipe of detail.menu.recipes) {
        const used = Number(recipe.qtyNeeded) * qty;
        const key = recipe.ingredientId;
        usageByIngredient.set(key, (usageByIngredient.get(key) || 0) + used);
      }
    }
  }

  return ingredients.map((ingredient) => {
    const usedQty = usageByIngredient.get(ingredient.id) || 0;
    const burnRatePerDay = usedQty / lookbackDays;
    const currentStock = Number(ingredient.stockQty);
    const daysToEmpty = burnRatePerDay > 0 ? currentStock / burnRatePerDay : null;

    return {
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      unit: ingredient.unit,
      currentStock,
      burnRatePerDay,
      daysToEmpty,
      alertLevel:
        daysToEmpty === null
          ? "STABLE"
          : daysToEmpty <= 2
            ? "CRITICAL"
            : daysToEmpty <= 5
              ? "WARNING"
              : "STABLE",
      message:
        daysToEmpty === null
          ? `Belum ada konsumsi data untuk ${ingredient.name} dalam ${lookbackDays} hari terakhir.`
          : `Estimasi ${ingredient.name} akan habis dalam ${Math.max(1, Math.floor(daysToEmpty))} hari berdasarkan tren ${lookbackDays} hari.`
    };
  });
}
