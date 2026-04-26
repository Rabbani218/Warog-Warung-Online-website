export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ProductCrud from "@/components/ProductCrud";
import BannerCrud from "@/components/BannerCrud";
import AdminHeader from "@/components/AdminHeader";

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  return (
    <main className="w-full min-h-screen">
      <div className="w-full space-y-8">
        <AdminHeader 
          badge="Product & Ads"
          title={<>Kelola <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600">Produk & Banner</span></>}
          description="Atur katalog produk warung Anda dan kelola banner promosi untuk menarik pelanggan."
          badgeColor="indigo"
        />

        <div className="flex flex-col gap-12">
          <ProductCrud />
          <BannerCrud />
        </div>
      </div>
    </main>
  );
}
