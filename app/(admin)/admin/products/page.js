import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminTopNav from "@/components/AdminTopNav";
import ProductCrud from "@/components/ProductCrud";
import BannerCrud from "@/components/BannerCrud";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  return (
    <main className="admin-shell" style={{ padding: "2rem 1rem" }}>
      <div className="w-full max-w-7xl mx-auto">
        <header style={{ marginBottom: "2rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <span className="badge">Product & Ads</span>
            <h1 className="retro-heading" style={{ margin: "0.5rem 0 0", fontSize: "1.8rem" }}>
              Kelola Produk & Banner
            </h1>
          </div>
          <AdminTopNav currentPath="/admin/products" />
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <ProductCrud />
          <BannerCrud />
        </div>
      </div>
    </main>
  );
}
