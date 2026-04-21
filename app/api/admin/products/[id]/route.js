import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function PUT(request, { params }) {
  const session = await ensureAdmin();
  if (!session) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const id = params.id;

  const updated = await prisma.menu.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      imageUrl: body.imageUrl,
      price: Number(body.price || 0),
      isActive: body.isActive !== false
    }
  });

  await prisma.recipe.deleteMany({ where: { menuId: id } });

  if (Array.isArray(body.recipes) && body.recipes.length) {
    await prisma.recipe.createMany({
      data: body.recipes.map((recipe) => ({
        menuId: id,
        ingredientId: recipe.ingredientId,
        qtyNeeded: Number(recipe.qtyNeeded || 0)
      }))
    });
  }

  return Response.json(updated);
}

export async function DELETE(_request, { params }) {
  const session = await ensureAdmin();
  if (!session) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  await prisma.menu.delete({ where: { id: params.id } });
  return Response.json({ success: true });
}
