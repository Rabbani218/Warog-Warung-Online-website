import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getDefaultStore } from "@/lib/store";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, bio, address, whatsappNumber } = body;

    const store = await getDefaultStore();
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: {
        name: String(name || "").trim(),
        bio: String(bio || "").trim(),
        address: String(address || "").trim(),
        whatsappNumber: String(whatsappNumber || "").trim(),
      }
    });

    return NextResponse.json({ success: true, store: updatedStore });
  } catch (error) {
    console.error("[StoreSettingsAPI] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
