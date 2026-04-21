import { prisma } from "@/lib/prisma";
import { getDefaultStore } from "@/lib/store";
import { emitKotUpdate } from "@/lib/kot-events";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

function generateCode(prefix) {
  const rand = Math.floor(Math.random() * 90000 + 10000);
  return `${prefix}-${Date.now()}-${rand}`;
}

export async function POST(request) {
  const body = await request.json();
  const items = Array.isArray(body.items) ? body.items : [];

  if (!items.length) {
    return Response.json({ message: "Keranjang kosong." }, { status: 400 });
  }

  for (const item of items) {
    const qty = Number(item.quantity);
    if (!item.menuId || !Number.isFinite(qty) || qty <= 0) {
      return Response.json({ message: "Item checkout tidak valid." }, { status: 400 });
    }
  }

  const store = await getDefaultStore();

  if (!store) {
    return Response.json({ message: "Store belum tersedia." }, { status: 500 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const menuIds = [...new Set(items.map((item) => item.menuId))];
      const menus = await tx.menu.findMany({
        where: { id: { in: menuIds }, storeId: store.id, isActive: true },
        include: {
          recipes: {
            include: { ingredient: true }
          }
        }
      });

      if (menus.length !== menuIds.length) {
        throw new Error("Sebagian menu tidak ditemukan atau nonaktif.");
      }

      const menuMap = new Map(menus.map((menu) => [menu.id, menu]));
      const required = new Map();

      for (const item of items) {
        const menu = menuMap.get(item.menuId);
        if (!menu) {
          throw new Error("Menu tidak valid.");
        }

        const qty = Number(item.quantity || 1);
        for (const recipe of menu.recipes) {
          const key = recipe.ingredientId;
          const needed = Number(recipe.qtyNeeded) * qty;
          required.set(key, (required.get(key) || 0) + needed);
        }
      }

      const ingredientIds = [...required.keys()];
      const ingredients = await tx.ingredient.findMany({
        where: { id: { in: ingredientIds }, storeId: store.id }
      });
      const ingredientMap = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));

      for (const [ingredientId, neededQty] of required.entries()) {
        const ingredient = ingredientMap.get(ingredientId);
        if (!ingredient) {
          throw new Error("Bahan baku tidak ditemukan.");
        }

        if (Number(ingredient.stockQty) - neededQty < 0) {
          throw new Error(`Bahan baku ${ingredient.name} habis`);
        }
      }

      for (const [ingredientId, neededQty] of required.entries()) {
        const updated = await tx.ingredient.updateMany({
          where: {
            id: ingredientId,
            storeId: store.id,
            stockQty: {
              gte: new Prisma.Decimal(neededQty)
            }
          },
          data: {
            stockQty: {
              decrement: new Prisma.Decimal(neededQty)
            }
          }
        });

        if (updated.count === 0) {
          const missing = ingredientMap.get(ingredientId);
          throw new Error(`Bahan baku ${missing?.name || ingredientId} habis`);
        }
      }

      let subTotal = 0;
      const detailData = items.map((item) => {
        const menu = menuMap.get(item.menuId);
        const quantity = Number(item.quantity);
        const unitPrice = Number(menu.price);
        const lineTotal = quantity * unitPrice;
        subTotal += lineTotal;

        return {
          menuId: menu.id,
          quantity,
          unitPrice,
          lineTotal,
          note: item.note || null
        };
      });

      const taxAmount = subTotal * 0.11;
      const grandTotal = subTotal + taxAmount;
      const orderCode = generateCode("ORD");

      const order = await tx.order.create({
        data: {
          storeId: store.id,
          orderCode,
          tableNumber: body.tableNumber || null,
          status: "PENDING",
          paymentMethod: body.paymentMethod || "CASH",
          subTotal,
          taxAmount,
          grandTotal,
          details: {
            create: detailData
          }
        },
        include: {
          details: {
            include: {
              menu: true
            }
          }
        }
      });

      const invoiceNumber = generateCode("INV");
      await tx.invoice.create({
        data: {
          orderId: order.id,
          invoiceNumber,
          invoiceUrl: `/invoice/${order.id}`
        }
      });

      const ticket = await tx.kOTicket.create({
        data: {
          orderId: order.id,
          payload: {
            orderCode: order.orderCode,
            tableNumber: order.tableNumber,
            items: order.details.map((detail) => ({
              menuName: detail.menu.name,
              quantity: detail.quantity,
              note: detail.note
            }))
          }
        }
      });

      return {
        orderId: order.id,
        orderCode: order.orderCode,
        invoiceNumber,
        subTotal,
        taxAmount,
        grandTotal,
        kotId: ticket.id,
        kot: order.details.map((detail) => ({
          menuName: detail.menu.name,
          quantity: detail.quantity,
          note: detail.note
        }))
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    emitKotUpdate({
      type: "KOT_CREATED",
      kotId: result.kotId,
      orderCode: result.orderCode,
      status: "NEW",
      createdAt: Date.now()
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    return Response.json({ message: error.message || "Checkout gagal." }, { status: 409 });
  }
}
