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
    <main className="w-full min-h-screen">
      <div className="w-full space-y-8">
        <header className="mb-8">
          <div className="mb-4">
            <span className="badge">Product & Ads</span>
            <h1 className="retro-heading mt-2 text-3xl font-bold">
              Kelola Produk & Banner
            </h1>
          </div>
          <AdminTopNav currentPath="/admin/products" />
        </header>

        <div className="flex flex-col gap-12">
          <ProductCrud />
          <BannerCrud />
        </div>
      </div>
    </main>
  );
}
