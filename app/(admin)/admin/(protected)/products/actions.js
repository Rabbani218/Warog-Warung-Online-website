"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getAdminStoreId() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const store = await prisma.store.findFirst({
    where: { ownerId: session.user.id }
  });

  if (!store) throw new Error("Store not found");
  return store.id;
}

export async function upsertProductAction(data) {
  try {
    const storeId = await getAdminStoreId();
    const { id, name, slug, description, imageUrl, price, category, preparationTime, isAvailable, isActive } = data;

    // Build payload - exclude slug on update if name hasn't changed to avoid unique constraint error
    const payload = {
      storeId,
      name,
      description,
      imageUrl,
      price: parseFloat(price),
      category: category || "Makanan",
      preparationTime: parseInt(preparationTime) || 10,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isActive: isActive !== undefined ? isActive : true,
    };

    // Only update slug for new products or when name changes
    if (!id) {
      payload.slug = slug;
    }

    if (id) {
      // For updates, only include slug if it was explicitly changed
      const existing = await prisma.menu.findUnique({ where: { id } });
      if (existing && existing.name !== name) {
        payload.slug = slug;
      }
      await prisma.menu.update({
        where: { id },
        data: payload
      });
    } else {
      await prisma.menu.create({
        data: payload
      });
    }

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Upsert Product Error:", error);

    // ▸ Task 1: Handle Unique Slug Error (P2002)
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      return { 
        success: false, 
        message: "Nama atau Slug ini sudah digunakan. Silakan gunakan nama lain." 
      };
    }

    return { success: false, message: error.message };
  }
}

export async function deleteProductAction(id) {
  try {
    const storeId = await getAdminStoreId();
    await prisma.menu.delete({
      where: { id, storeId }
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
