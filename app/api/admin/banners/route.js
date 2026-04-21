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
  const banners = await prisma.banner.findMany({
    where: { storeId: store.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });

  return Response.json(banners);
}

export async function POST(request) {
  const session = await ensureAdmin();
  if (!session) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const store = await getDefaultStore();

  const banner = await prisma.banner.create({
    data: {
      storeId: store.id,
      title: body.title,
      imageUrl: body.imageUrl,
      targetUrl: body.targetUrl,
      sortOrder: Number(body.sortOrder || 0),
      isActive: body.isActive !== false
    }
  });

  return Response.json(banner, { status: 201 });
}
