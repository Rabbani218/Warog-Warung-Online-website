"use server";

export const maxDuration = 60;

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

export async function upsertAdAction(data) {
  try {
    const storeId = await getAdminStoreId();
    const { id, title, imageUrl, targetUrl, sortOrder, isActive, startDate, endDate } = data;

    const payload = {
      storeId,
      title,
      imageUrl,
      targetUrl,
      sortOrder: parseInt(sortOrder) || 0,
      isActive: isActive !== undefined ? isActive : true,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    };

    if (id) {
      await prisma.banner.update({
        where: { id },
        data: payload
      });
    } else {
      await prisma.banner.create({
        data: payload
      });
    }

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Upsert Ad Error:", error);
    return { success: false, message: error.message };
  }
}

export async function deleteAdAction(id) {
  try {
    const storeId = await getAdminStoreId();
    await prisma.banner.delete({
      where: { id, storeId }
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
