"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateIngredientStock(ingredientId, newQty) {
  try {
    const qty = parseFloat(newQty);
    if (isNaN(qty)) throw new Error("Kuantitas harus berupa angka.");

    const ingredient = await prisma.ingredient.update({
      where: { id: ingredientId },
      data: { stockQty: qty }
    });

    revalidatePath("/admin/dashboard");
    return { success: true, name: ingredient.name, newQty: qty };
  } catch (error) {
    console.error("Stock Update Error:", error);
    return { success: false, message: error.message };
  }
}
