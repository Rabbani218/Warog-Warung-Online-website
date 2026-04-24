import { findStore } from "@/lib/store";
import { prisma } from "@/lib/prisma";
import ClientShop from "@/components/ClientShop";

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

  // ── LOOP FIX: NEVER redirect from homepage ──────────────────────
  // If no store exists, render the page with a fallback dummy store.
  // The admin can set up a store via /admin → /setup flow instead.
  // Previously: redirect("/setup") here caused a 307 infinite loop.

  const tableNumber = (typeof searchParams?.table === "string" ? searchParams?.table?.trim() : "");

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
