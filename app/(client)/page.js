import { findStore } from "@/lib/store";
import { prisma } from "@/lib/prisma";
import ClientShop from "@/components/ClientShop";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Wareb | Warteg Modern Online",
  description: "Belanja menu warteg modern dengan checkout digital dan pesanan langsung ke dapur."
};

export default async function ClientHomePage({ searchParams }) {
  try {
    const store = await findStore();

    if (!store) {
      redirect("/setup");
    }

    const tableNumber = String(searchParams?.table || "").trim();

    const [menus, banners, paymentSettings, employees, reviews] = await Promise.all([
      prisma.menu.findMany({
        where: { storeId: store.id, isActive: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.banner.findMany({
        where: { storeId: store.id, isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
      }),
      prisma.paymentSettings.findUnique({
        where: { storeId: store.id }
      }),
      prisma.employee.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: "asc" }
      }),
      prisma.review.findMany({
        where: { menu: { storeId: store.id } },
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: "desc" }
      })
    ]);

    return (
      <ClientShop
        store={store}
        menus={menus}
        banners={banners}
        tableNumber={tableNumber}
        paymentSettings={paymentSettings}
        employees={employees}
        reviews={reviews}
      />
    );
  } catch (error) {
    console.error("Critical Client Page Error:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Terjadi Gangguan Sistem</h2>
        <p className="text-gray-600 mb-4">Kami tidak dapat memuat data produk saat ini. Silakan coba beberapa saat lagi.</p>
        <a href="/" className="px-6 py-2 bg-crimson-600 text-white rounded-full font-medium inline-block">
          Muat Ulang Halaman
        </a>
      </div>
    );
  }
}
