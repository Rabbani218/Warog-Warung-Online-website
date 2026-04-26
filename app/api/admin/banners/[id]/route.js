import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function PUT(request, { params }) {
  try {
    const session = await ensureAdmin();
    if (!session) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Parse sortOrder as integer
    const parsedSortOrder = parseInt(body.sortOrder, 10);
    if (isNaN(parsedSortOrder)) {
      return Response.json({ message: "Sort order harus berupa angka valid." }, { status: 400 });
    }

    const updated = await prisma.banner.update({
      where: { id: params.id },
      data: {
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

    return Response.json(updated);
  } catch (error) {
    console.error("[API Banner PUT] Error:", error);
    return Response.json({ message: error.message || "Gagal memperbarui banner." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const session = await ensureAdmin();
    if (!session) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    await prisma.banner.delete({ where: { id: params.id } });

    // Revalidate cache
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");

    return Response.json({ success: true });
  } catch (error) {
    console.error("[API Banner DELETE] Error:", error);
    return Response.json({ message: error.message || "Gagal menghapus banner." }, { status: 500 });
  }
}
