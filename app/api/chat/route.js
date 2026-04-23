import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { findStore } from "@/lib/store";

export const dynamic = "force-dynamic";

const FALLBACK_REPLY =
  "Maaf, sistem AI kami sedang istirahat sebentar. Silakan hubungi kasir secara langsung.";
const BASE_SYSTEM_PROMPT =
  "Kamu adalah asisten AI ramah untuk Warung Digital Wareb. Jawablah dengan singkat, sopan, dan dalam bahasa Indonesia.";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = String(body?.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { reply: "Silakan tulis pesan terlebih dahulu, ya." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is missing.");
    }

    const [session, store] = await Promise.all([
      getServerSession(authOptions),
      findStore(),
    ]);

    if (store) {
      prisma.chatMessage
        .create({
        data: {
          storeId: store.id,
          userId: session?.user?.id || null,
            message,
            role: "USER",
          },
        })
        .catch((error) => console.error("User chat log failed:", error));
    }

    const menus = store
      ? await prisma.menu.findMany({
          where: { storeId: store.id, isActive: true },
          select: { name: true, price: true, description: true },
          take: 20,
        })
      : [];

    const userOrders = session?.user?.id
      ? await prisma.order.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: { orderCode: true, status: true, grandTotal: true },
        })
      : [];

    const menuContext = menus.length
      ? menus
          .map(
            (item) =>
              `- ${item.name}: Rp ${Number(item.price).toLocaleString("id-ID")}. ${item.description || ""}`
          )
          .join("\n")
      : "- Data menu belum tersedia.";

    const orderContext = userOrders.length
      ? userOrders
          .map(
            (order) =>
              `- ${order.orderCode} (${order.status}) total Rp ${Number(order.grandTotal).toLocaleString("id-ID")}`
          )
          .join("\n")
      : "- Tidak ada riwayat pesanan terbaru.";

    const prompt = `${BASE_SYSTEM_PROMPT}

KONTEKS TOKO:
- Nama toko: ${store?.name || "Wareb"}
- Alamat: ${store?.address || "-"}
- Jam operasional: ${store?.operationalHours || "Tidak ditentukan"}

MENU TERSEDIA:
${menuContext}

PESANAN TERAKHIR USER:
${orderContext}

PESAN USER:
${message}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const reply = result?.response?.text?.()?.trim() || FALLBACK_REPLY;

    if (store) {
      prisma.chatMessage
        .create({
          data: {
            storeId: store.id,
            userId: session?.user?.id || null,
            message: reply,
            role: "AI",
          },
        })
        .catch((error) => console.error("AI chat log failed:", error));
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[ChatAPI] Gemini request failed:", error);
    return NextResponse.json({ reply: FALLBACK_REPLY });
  }
}
