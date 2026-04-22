import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { databaseUnavailableResponse, hasDatabaseUrl } from "@/lib/runtimeEnv";

export const dynamic = "force-dynamic";

function slugify(value) {
  return String(value || "wareb").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function createUniqueStore(tx, ownerId, storeName) {
  const baseSlug = slugify(storeName) || "wareb";

  const existingBase = await tx.store.findUnique({ where: { slug: baseSlug } });
  let finalSlug = baseSlug;

  if (existingBase) {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    finalSlug = `${baseSlug}-${randomSuffix}`;
  }

  return tx.store.create({
    data: {
      ownerId,
      name: storeName,
      slug: finalSlug,
      description: "Platform warteg interaktif dengan rasa lokal dan UX modern.",
      heroTitle: "Promo Hemat Harian",
      heroSubtitle: "Klik menu favoritmu, langsung kirim ke dapur."
    }
  });
}

export async function POST(request) {
  try {
    if (!hasDatabaseUrl()) {
      return databaseUnavailableResponse("Registrasi admin");
    }

    const body = await request.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "").trim();
    const role = body?.role === "ADMIN" ? "ADMIN" : "USER";

    if (!name || !email || !password) {
      return Response.json({ error: "Nama, email, dan password wajib diisi." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return Response.json({ error: "Format email tidak valid." }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json({ error: "Password minimal 8 karakter." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return Response.json({ error: "Email sudah terdaftar." }, { status: 409 });
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
    }, {
      maxWait: 10000,
      timeout: 15000
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
