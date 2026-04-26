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
    where: { storeId: store.id },
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

    // Generate unique slug if duplicate
    let finalSlug = body.slug;
    try {
      const existingMenu = await prisma.menu.findUnique({
        where: { slug: finalSlug }
      });
      if (existingMenu) {
        finalSlug = body.slug + '-' + Date.now().toString().slice(-4);
      }
    } catch (checkError) {
      console.warn("[API Products] Slug check failed, proceeding with original slug:", checkError.message);
    }

    // Parse price as integer
    const parsedPrice = parseInt(body.price, 10);
    if (isNaN(parsedPrice)) {
      return Response.json({ message: "Harga harus berupa angka valid." }, { status: 400 });
    }

    const menu = await prisma.menu.create({
      data: {
        storeId: store.id,
        name: body.name,
        slug: finalSlug,
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
    
    // Handle Unique Slug Error (P2002) - auto-retry with unique slug
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      const uniqueSlug = body.slug + '-' + Date.now().toString().slice(-4);
      try {
        const parsedPrice = parseInt(body.price, 10);
        const retryMenu = await prisma.menu.create({
          data: {
            storeId: store.id,
            name: body.name,
            slug: uniqueSlug,
            description: body.description,
            imageUrl: body.imageUrl,
            price: isNaN(parsedPrice) ? 0 : parsedPrice,
            isActive: body.isActive !== false
          }
        });
        revalidatePath("/admin/products");
        revalidatePath("/admin/dashboard");
        return Response.json(retryMenu, { status: 201 });
      } catch (retryError) {
        return Response.json(
          { message: "Gagal membuat produk setelah mencoba slug alternatif." }, 
          { status: 500 }
        );
      }
    }

    return Response.json(
      { message: error.message || "Gagal menyimpan produk." }, 
      { status: 500 }
    );
  }
}
