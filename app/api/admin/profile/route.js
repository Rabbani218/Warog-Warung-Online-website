import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, avatar } = await req.json();

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ 
      message: "Profile updated successfully", 
      user: { name: user.name, email: user.email, avatar: user.avatar } 
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ message: "Gagal memperbarui profil" }, { status: 500 });
  }
}
