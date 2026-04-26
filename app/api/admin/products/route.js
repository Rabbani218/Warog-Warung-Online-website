import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultStore } from "@/lib/store";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await ensureAdmin();
  if (!session) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const store = await getDefaultStore();
  const products = await prisma.menu.findMany({
    include: {
      recipes: {
        include: {
          ingredient: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return Response.json(products);
}

export async function POST(request) {
  try {
    const session = await ensureAdmin();
    if (!session) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const store = await getDefaultStore();

    if (!body.name || !body.slug) {
      return Response.json({ message: "Nama dan Slug wajib diisi." }, { status: 400 });
    }

    // Ambil base slug dari request
    const baseSlug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Tambahkan 4 digit acak dari timestamp agar pasti unik
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    // Parse price as integer
    const parsedPrice = parseInt(body.price, 10);
    if (isNaN(parsedPrice)) {
      return Response.json({ message: "Harga harus berupa angka valid." }, { status: 400 });
    }

    const menu = await prisma.menu.create({
      data: {
        storeId: store.id,
        name: body.name,
        slug: uniqueSlug,
        description: body.description,
        imageUrl: body.imageUrl,
        price: parsedPrice,
        isActive: body.isActive !== false,
        recipes: {
          create: (body.recipes || []).map((recipe) => ({
            ingredientId: recipe.ingredientId,
            qtyNeeded: Number(recipe.qtyNeeded || 0)
          }))
        }
      }
    });

    // Revalidate cache
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");

    return Response.json(menu, { status: 201 });
  } catch (error) {
    console.error("[API Products POST] Error:", error);
    
    return Response.json(
      { message: error.message || "Gagal menyimpan produk." }, 
      { status: 500 }
    );
  }
}

