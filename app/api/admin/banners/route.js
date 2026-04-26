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
  const banners = await prisma.banner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });

  return Response.json(banners);
}

export async function POST(request) {
  try {
    const session = await ensureAdmin();
    if (!session) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const store = await getDefaultStore();

    // Parse sortOrder as integer
    const parsedSortOrder = parseInt(body.sortOrder, 10);
    if (isNaN(parsedSortOrder)) {
      return Response.json({ message: "Sort order harus berupa angka valid." }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        storeId: store.id,
        title: body.title,
        imageUrl: body.imageUrl,
        targetUrl: body.targetUrl,
        sortOrder: parsedSortOrder,
        isActive: body.isActive !== false
      }
    });

    // Revalidate cache
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");

    return Response.json(banner, { status: 201 });
  } catch (error) {
    console.error("[API Banners POST] Error:", error);
    return Response.json(
      { message: error.message || "Gagal menyimpan banner." }, 
      { status: 500 }
    );
  }
}
