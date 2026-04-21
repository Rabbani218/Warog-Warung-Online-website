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
  const updated = await prisma.banner.update({
    where: { id: params.id },
    data: {
      title: body.title,
      imageUrl: body.imageUrl,
      targetUrl: body.targetUrl,
      sortOrder: Number(body.sortOrder || 0),
      isActive: body.isActive !== false
    }
  });

  return Response.json(updated);
}

export async function DELETE(_request, { params }) {
  const session = await ensureAdmin();
  if (!session) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  await prisma.banner.delete({ where: { id: params.id } });
  return Response.json({ success: true });
}
