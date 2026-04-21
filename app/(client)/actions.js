"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitReviewAction(menuId, rating, comment) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error("Anda harus login untuk memberikan rating.");
  }

  const newReview = await prisma.review.create({
    data: {
      userId: session.user.id,
      menuId,
      rating: Number(rating),
      comment: String(comment).trim() || null
    }
  });

  revalidatePath("/");
  return newReview;
}
