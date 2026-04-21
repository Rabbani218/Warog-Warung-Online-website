import { prisma } from "@/lib/prisma";
import { getDefaultStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const store = await getDefaultStore();

    if (!store) {
      return Response.json({ message: "Store belum tersedia." }, { status: 404 });
    }

    const [banners, menus] = await Promise.all([
      prisma.banner.findMany({
        where: { storeId: store.id, isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
      }),
      prisma.menu.findMany({
        where: { storeId: store.id, isActive: true },
        orderBy: { createdAt: "desc" }
      })
    ]);

    return Response.json({ store, banners, menus });
  } catch (error) {
    console.error("Store API failure:", error);
    return Response.json({ message: "Layanan toko sedang tidak tersedia." }, { status: 503 });
  }
}
