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

export async function createIngredient(data) {
  try {
    const { name, unit, initialStock } = data;
    
    // Get default store (first one)
    const store = await prisma.store.findFirst();
    if (!store) throw new Error("Toko tidak ditemukan.");

    const ingredient = await prisma.ingredient.create({
      data: {
        name: name.trim(),
        unit: unit.trim(),
        stockQty: parseFloat(initialStock) || 0,
        minimumStock: 10, // Default minimum
        storeId: store.id
      }
    });

    revalidatePath("/admin/dashboard");
    return { success: true, data: ingredient };
  } catch (error) {
    console.error("Create Ingredient Error:", error);
    return { success: false, message: error.message };
  }
}

export async function updatePaymentStatus(orderId, paymentStatus) {
  try {
    const validStatuses = ["PENDING", "PAID", "FAILED"];
    if (!validStatuses.includes(paymentStatus)) {
      throw new Error("Status pembayaran tidak valid.");
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus }
    });

    revalidatePath("/admin/dashboard");
    return { success: true, orderCode: order.orderCode, paymentStatus };
  } catch (error) {
    console.error("Payment Status Update Error:", error);
    return { success: false, message: error.message };
  }
}


