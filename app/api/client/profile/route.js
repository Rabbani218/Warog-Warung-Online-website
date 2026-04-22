import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, bio, address, hobbies, favoriteFood, avatar } = body;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        bio,
        address,
        hobbies,
        favoriteFood,
        avatar
      }
    });

    return Response.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return Response.json({ message: "Failed to update profile" }, { status: 500 });
  }
}
