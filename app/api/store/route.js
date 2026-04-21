import { prisma } from "@/lib/prisma";
import { getDefaultStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const store = await getDefaultStore();

    if (!store) {
      return Response.json({ message: "Store belum tersedia." }, { status: 404 });
    }

    const [banners, menus, paymentSettings, employees] = await Promise.all([
      prisma.banner.findMany({
        where: { storeId: store.id, isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
      }),
      prisma.menu.findMany({
        where: { storeId: store.id, isActive: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.paymentSettings.findUnique({
        where: { storeId: store.id }
      }),
      prisma.employee.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: "asc" }
      })
    ]);

    return Response.json({ store, banners, menus, paymentSettings, employees });
  } catch (error) {
    console.error("Store API failure:", error);
    return Response.json({ message: "Layanan toko sedang tidak tersedia." }, { status: 503 });
  }
}
