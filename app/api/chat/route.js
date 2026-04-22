import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { findStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const { messages } = await req.json();
  const session = await getServerSession(authOptions);
  
  const store = await findStore();
  
  // Log User Message to Database (Non-blocking)
  try {
    const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1] : null;
    if (lastMessage && lastMessage.role === "user" && store) {
      // Use fire-and-forget or ensure it doesn't throw to top level
      prisma.chatMessage.create({
        data: {
          storeId: store.id,
          userId: session?.user?.id || null,
          message: lastMessage.content,
          role: "USER"
        }
      }).catch(e => console.error("Async logging failed:", e));
    }
  } catch (err) {
    console.error("[ChatAPI] Logging logic error:", err);
  }

  const menus = await prisma.menu.findMany({
    where: { storeId: store?.id, isActive: true },
    select: { name: true, price: true, description: true, category: true }
  });

  let userOrders = [];
  if (session?.user?.id) {
    userOrders = await prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { orderCode: true, status: true, grandTotal: true, createdAt: true }
    });
  }

  const systemPrompt = `
Anda adalah asisten Customer Service AI yang ramah untuk toko "${store?.name || "Wareb Platform"}".
Tugas Anda adalah membantu pelanggan dengan pertanyaan seputar menu, toko, atau status pesanan mereka.

INFORMASI TOKO:
- Nama: ${store?.name || "Wareb"}
- Bio: ${store?.bio || "-"}
- Alamat: ${store?.address || "-"}
- Jam Operasional: ${store?.operationalHours || "Tidak ditentukan"}

DAFTAR MENU:
${menus.map(m => `- ${m.name} (${m.category}): Rp ${Number(m.price).toLocaleString("id-ID")}. ${m.description || ""}`).join("\n")}

${session?.user ? `
INFORMASI PENGGUNA:
- Nama: ${session.user.name}
- Email: ${session.user.email}

PESANAN TERAKHIR PENGGUNA:
${userOrders.length > 0 
  ? userOrders.map(o => `- Kode: ${o.orderCode}, Status: ${o.status}, Total: Rp ${Number(o.grandTotal).toLocaleString("id-ID")}, Tanggal: ${new Date(o.createdAt).toLocaleDateString("id-ID")}`).join("\n")
  : "Pengguna belum memiliki riwayat pesanan."}
` : "Pengguna belum login. Sarankan mereka login untuk melihat status pesanan."}

INSTRUKSI:
1. Jawablah dalam Bahasa Indonesia yang sopan dan membantu.
2. Berikan jawaban yang singkat namun informatif.
3. Jika ditanya tentang status pesanan, gunakan data "PESANAN TERAKHIR PENGGUNA" di atas.
4. Jangan memberikan informasi internal atau teknis sistem.
5. Jika pengguna ingin memesan, beri tahu mereka untuk menambah menu ke keranjang di halaman utama.
6. Tetaplah dalam karakter sebagai asisten toko.
`;

  const result = await streamText({
    model: google("models/gemini-1.5-flash"),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
