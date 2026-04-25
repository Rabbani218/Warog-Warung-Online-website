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

const MODEL_CANDIDATES = [
  process.env.GOOGLE_GENERATIVE_MODEL,
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b"
].filter(Boolean);

function getGeminiApiKey() {
  const raw =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    "";

  return String(raw).replace(/^['\"]|['\"]$/g, "").trim();
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("AI request timeout")), ms);
    })
  ]);
}

function buildLocalAssistantReply({ message, menus, userOrders, store }) {
  const lower = String(message || "").toLowerCase();

  if (/jam|buka|tutup|operasional/.test(lower)) {
    return `Jam operasional ${store?.name || "toko"} saat ini: ${store?.operationalHours || "belum diset"}.`;
  }

  if (/alamat|lokasi|maps|map/.test(lower)) {
    return `Alamat ${store?.name || "toko"}: ${store?.address || "belum tersedia"}.`;
  }

  if (/pesanan|order|status/.test(lower) && userOrders.length > 0) {
    const latest = userOrders[0];
    return `Pesanan terbaru Anda: ${latest.orderCode} dengan status ${latest.status}.`;
  }

  if (menus.length > 0) {
    const topMenus = menus
      .slice(0, 4)
      .map((item) => `${item.name} (Rp ${Number(item.price).toLocaleString("id-ID")})`)
      .join(", ");
    return `Kami punya beberapa menu favorit: ${topMenus}. Silakan tanya menu tertentu jika ingin rekomendasi lebih detail.`;
  }

  return FALLBACK_REPLY;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = String(body?.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { reply: "Silakan tulis pesan terlebih dahulu, ya." },
        { 
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" }
        }
      );
    }

    const apiKey = getGeminiApiKey();

    const session = await getServerSession(authOptions);
    let store = null;

    try {
      store = await findStore();
    } catch (storeError) {
      console.warn("[ChatAPI] Store lookup failed, continuing with minimal context:", storeError.message);
    }

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

    let menus = [];
    let userOrders = [];

    if (store) {
      try {
        menus = await prisma.menu.findMany({
          where: { storeId: store.id, isActive: true },
          select: { name: true, price: true, description: true },
          take: 20,
        });
      } catch (menuError) {
        console.warn("[ChatAPI] Menu lookup failed:", menuError.message);
      }
    }

    if (session?.user?.id) {
      try {
        userOrders = await prisma.order.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: { orderCode: true, status: true, grandTotal: true },
        });
      } catch (orderError) {
        console.warn("[ChatAPI] User order lookup failed:", orderError.message);
      }
    }

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

    let reply = "";

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);

      for (const modelName of MODEL_CANDIDATES) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              maxOutputTokens: 500,
              temperature: 0.7,
            }
          });

          const result = await withTimeout(model.generateContent(prompt), 10000);
          const response = await result.response;

          try {
            reply = String(response.text() || "").trim();
          } catch (textError) {
            console.warn("[ChatAPI] Could not extract text from Gemini response:", textError.message);
          }

          if (reply) {
            break;
          }
        } catch (modelError) {
          console.warn(`[ChatAPI] Model ${modelName} failed:`, modelError.message);
        }
      }
    } else {
      console.warn("[ChatAPI] Gemini API key not configured. Using local assistant fallback.");
    }

    if (!reply) {
      reply = buildLocalAssistantReply({ message, menus, userOrders, store });
    }

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

    // ▸ SAVE TO CHATLOG (Task 2: Central Inbox QnA)
    prisma.chatLog.create({
      data: {
        userId: session?.user?.id || null,
        userMessage: message,
        botReply: reply
      }
    }).catch(err => console.error("[ChatAPI] ChatLog save failed:", err));

    return NextResponse.json(
      { reply },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (error) {
    console.error("[ChatAPI] Critical error:", error.message, error.stack);
    return NextResponse.json(
      { reply: FALLBACK_REPLY },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}

