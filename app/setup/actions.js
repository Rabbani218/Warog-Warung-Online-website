"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasDatabaseUrl } from "@/lib/runtimeEnv";

function slugify(value) {
  return String(value || "wareb").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function buildUniqueStoreSlug(tx, storeName) {
  const baseSlug = slugify(storeName) || "wareb";
  let slug = baseSlug;
  let counter = 2;

  while (await tx.store.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

export async function createSetup(formData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect(`/setup?error=${encodeURIComponent("Sesi tidak valid, harap login kembali.")}`);
  }

  if (!hasDatabaseUrl()) {
    redirect(`/setup?error=${encodeURIComponent("Setup tidak bisa dijalankan karena DATABASE_URL belum tersedia di environment deployment.")}`);
  }

  const storeName = String(formData.get("storeName") || "").trim();

  if (!storeName) {
    redirect(`/setup?error=${encodeURIComponent("Nama toko wajib diisi.")}`);
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id },
        data: { role: "ADMIN" }
      });

      const slug = await buildUniqueStoreSlug(tx, storeName);

      await tx.store.create({
        data: {
          ownerId: session.user.id,
          name: storeName,
          slug,
          heroTitle: `${storeName} - Pesan cepat, bayar mudah`,
          heroSubtitle: "Selamat datang di kasir digital F&B Anda."
        }
      });
    });
  } catch (error) {
    console.error("Setup transaction failed:", error);
    redirect(`/setup?error=${encodeURIComponent("Setup gagal diproses. Coba lagi.")}`);
  }

  redirect("/admin/dashboard");
}
