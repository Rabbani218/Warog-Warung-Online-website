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

    // ── Sanitize API Key ─────────────────────────────────────────
    const rawApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
    const apiKey = rawApiKey.replace(/^["']|["']$/g, "").trim();

    if (!apiKey) {
      console.error("[ChatAPI] Gemini API key is missing in environment variables.");
      return NextResponse.json({ reply: FALLBACK_REPLY });
    }

    const [session, store] = await Promise.all([
      getServerSession(authOptions),
      findStore(),
    ]);

    // ── Log user message (asynchronous) ──────────────────────────
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
        .catch((error) => console.error("[ChatAPI] User chat log failed:", error));
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

    // ── Gemini Integration ────────────────────────────────────────
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let reply = "";

    try {
      reply = response.text().trim();
    } catch (textError) {
      console.warn("[ChatAPI] Could not extract text from Gemini response:", textError.message);
      // Fallback if blocked or empty
      const candidate = response.candidates?.[0];
      if (candidate?.finishReason === "SAFETY") {
        reply = "Maaf, saya tidak bisa menjawab pertanyaan tersebut karena alasan keamanan.";
      } else {
        reply = FALLBACK_REPLY;
      }
    }

    if (!reply) reply = FALLBACK_REPLY;

    // ── Log AI response (asynchronous) ────────────────────────────
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
        .catch((error) => console.error("[ChatAPI] AI chat log failed:", error));
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[ChatAPI] Critical error:", error.message, error.stack);
    return NextResponse.json({ reply: FALLBACK_REPLY });
  }
}

