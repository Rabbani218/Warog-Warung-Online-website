import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultStore } from "@/lib/store";

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
  const session = await ensureAdmin();
  if (!session) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const store = await getDefaultStore();

  const menu = await prisma.menu.create({
    data: {
      storeId: store.id,
      name: body.name,
      slug: body.slug,
      description: body.description,
      imageUrl: body.imageUrl,
      price: Number(body.price || 0),
      isActive: body.isActive !== false,
      recipes: {
        create: (body.recipes || []).map((recipe) => ({
          ingredientId: recipe.ingredientId,
          qtyNeeded: Number(recipe.qtyNeeded || 0)
        }))
      }
    }
  });

  return Response.json(menu, { status: 201 });
}
