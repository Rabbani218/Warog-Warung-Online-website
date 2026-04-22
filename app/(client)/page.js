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
  let store = null;
  let menus = [];
  let banners = [];
  let paymentSettings = null;
  let employees = [];
  let reviews = [];

  try {
    store = await findStore();
  } catch (err) {
    console.error("findStore Error:", err);
  }

  if (!store && !process.env.NEXT_PHASE) {
    // If absolutely no store and not in build phase, try to redirect or show setup
    // But to follow instructions "never show gangguan sistem", we might want a dummy store
    // However, redirecting to /setup is the standard app flow if no store exists.
    redirect("/setup");
  }

  const tableNumber = String(searchParams?.table || "").trim();

  try {
    const results = await Promise.allSettled([
      prisma.menu.findMany({
        where: { storeId: store?.id, isActive: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.banner.findMany({
        where: { storeId: store?.id, isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
      }),
      prisma.paymentSettings.findUnique({
        where: { storeId: store?.id }
      }),
      prisma.employee.findMany({
        where: { storeId: store?.id },
        orderBy: { createdAt: "asc" }
      }),
      prisma.review.findMany({
        where: { menu: { storeId: store?.id } },
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: "desc" }
      })
    ]);

    if (results[0].status === "fulfilled") menus = results[0].value;
    if (results[1].status === "fulfilled") banners = results[1].value;
    if (results[2].status === "fulfilled") paymentSettings = results[2].value;
    if (results[3].status === "fulfilled") employees = results[3].value;
    if (results[4].status === "fulfilled") reviews = results[4].value;
  } catch (error) {
    console.error("Graceful Degradation: Database Fetch Error", error);
  }

  return (
    <ClientShop
      store={store || { name: "Wareb Store", slug: "wareb" }}
      menus={menus}
      banners={banners}
      tableNumber={tableNumber}
      paymentSettings={paymentSettings}
      employees={employees}
      reviews={reviews}
    />
  );
}
