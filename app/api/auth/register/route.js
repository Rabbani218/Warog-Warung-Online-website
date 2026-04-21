import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function slugify(value) {
  return String(value || "wareb").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function createUniqueStore(tx, ownerId, storeName) {
  const baseSlug = slugify(storeName) || "wareb";

  for (let index = 0; index < 20; index += 1) {
    const suffix = index === 0 ? "" : `-${index + 1}`;
    const slug = `${baseSlug}${suffix}`;

    const existing = await tx.store.findUnique({ where: { slug } });
    if (existing) {
      continue;
    }

    return tx.store.create({
      data: {
        ownerId,
        name: storeName,
        slug,
        description: "Platform warteg interaktif dengan rasa lokal dan UX modern.",
        heroTitle: "Promo Hemat Harian",
        heroSubtitle: "Klik menu favoritmu, langsung kirim ke dapur."
      }
    });
  }

  throw new Error("Tidak bisa membuat slug toko yang unik.");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "").trim();
    const role = body?.role === "CLIENT" ? "CLIENT" : "ADMIN";

    if (!name || !email || !password) {
      return Response.json({ message: "Name, email, dan password wajib diisi." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return Response.json({ message: "Format email tidak valid." }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json({ message: "Password minimal 8 karakter." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return Response.json({ message: "Email sudah terdaftar." }, { status: 409 });
    }

    const passwordHash = await hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role
        }
      });

      if (role === "ADMIN") {
        await createUniqueStore(tx, createdUser.id, "Warteg Modern Wareb");
      }

      return createdUser;
    });

    return Response.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error("Register route failed:", error);

    if (error?.code === "P2002") {
      return Response.json({ message: "Data unik bentrok, silakan ulangi registrasi." }, { status: 409 });
    }

    return Response.json({ message: error?.message || "Terjadi kesalahan saat registrasi." }, { status: 500 });
  }
}
