import { getDefaultStore } from "@/lib/store";
import { prisma } from "@/lib/prisma";
import ClientShop from "@/components/ClientShop";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Wareb | Warteg Modern Online",
  description: "Belanja menu warteg modern dengan checkout digital dan pesanan langsung ke dapur."
};

export default async function ClientHomePage() {
  const store = await getDefaultStore();

  if (!store) {
    return (
      <main className="container" style={{ padding: "2rem 0" }}>
        <section className="panel" style={{ padding: "1rem" }}>
          <h1>Store belum tersedia</h1>
        </section>
      </main>
    );
  }

  const [menus, banners] = await Promise.all([
    prisma.menu.findMany({ where: { storeId: store.id, isActive: true }, orderBy: { createdAt: "desc" } }),
    prisma.banner.findMany({ where: { storeId: store.id, isActive: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] })
  ]);

  return <ClientShop store={store} menus={menus} banners={banners} />;
}
