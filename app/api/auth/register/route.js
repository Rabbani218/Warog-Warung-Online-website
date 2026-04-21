import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role = "ADMIN" } = body;

    if (!name || !email || !password) {
      return Response.json({ message: "Name, email, dan password wajib diisi." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return Response.json({ message: "Email sudah terdaftar." }, { status: 409 });
    }

    const passwordHash = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role === "CLIENT" ? "CLIENT" : "ADMIN"
      }
    });

    const storeCount = await prisma.store.count({ where: { ownerId: user.id } });

    if (storeCount === 0 && user.role === "ADMIN") {
      await prisma.store.create({
        data: {
          ownerId: user.id,
          name: "Warteg Modern Wareb",
          slug: `wareb-${user.id.slice(0, 6)}`,
          description: "Platform warteg interaktif dengan rasa lokal dan UX modern.",
          heroTitle: "Promo Hemat Harian",
          heroSubtitle: "Klik menu favoritmu, langsung kirim ke dapur."
        }
      });
    }

    return Response.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error("Register route failed:", error);
    return Response.json({ message: error?.message || "Terjadi kesalahan saat registrasi." }, { status: 500 });
  }
}
