"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized. Please login first.");
  return session.user;
}

export async function submitReviewAction({ menuId, rating, comment }) {
  try {
    const user = await getAuthenticatedUser();
    
    await prisma.review.create({
      data: {
        userId: user.id,
        menuId,
        rating: parseInt(rating),
        comment
      }
    });

    revalidatePath(`/product/[slug]`, "layout");
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function askQuestionAction({ menuId, question }) {
  try {
    const user = await getAuthenticatedUser();
    
    await prisma.qnA.create({
      data: {
        userId: user.id,
        menuId,
        question
      }
    });

    revalidatePath(`/product/[slug]`, "layout");
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function replyQuestionAction({ qnaId, answer }) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "ADMIN") throw new Error("Forbidden. Admin access required.");
    
    await prisma.qnA.update({
      where: { id: qnaId },
      data: { answer }
    });

    revalidatePath("/admin/qna");
    revalidatePath(`/product/[slug]`, "layout");
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
