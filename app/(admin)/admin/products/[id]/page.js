import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { 
  BarChart3, Star, ShoppingBag, Users, 
  ArrowLeft, TrendingUp, Calendar, MessageSquare 
} from "lucide-react";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";

export const dynamic = "force-dynamic";

export default async function AdminProductInsightPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const product = await prisma.menu.findUnique({
    where: { id: params.id },
    include: {
      reviews: {
        include: { user: true },
        orderBy: { createdAt: "desc" }
      },
      orderDetails: true,
      qnas: true
    }
  });

  if (!product) notFound();

  // Simple stats
  const totalSales = product.orderDetails.reduce((acc, curr) => acc + curr.quantity, 0);
  const revenue = totalSales * Number(product.price);
  const avgRating = product.reviews.length > 0 
    ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
    : "0";

  return (
    <main className="w-full max-w-6xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/products"
            className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft size={20} className="text-slate-500" />
          </Link>
          <div>
            <span className="badge-premium mb-1">Product Insights</span>
            <h1 className="text-3xl font-black text-slate-900">{product.name}</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <Link 
            href={`/admin/products/${product.id}/edit`}
            className="px-6 py-2.5 bg-slate-800 text-white rounded-2xl font-bold text-sm hover:bg-slate-900 transition-all"
          >
            Edit Produk
          </Link>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 space-y-2 border-l-4 border-l-[#FF6B6B]">
          <div className="flex justify-between text-slate-400">
            <ShoppingBag size={18} />
            <TrendingUp size={14} className="text-emerald-500" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Terjual</p>
          <p className="text-3xl font-black text-slate-900">{totalSales} <span className="text-xs font-bold text-slate-400">Porsi</span></p>
        </div>

        <div className="glass-panel p-6 space-y-2 border-l-4 border-l-amber-400">
          <div className="flex justify-between text-slate-400">
            <Star size={18} />
            <span className="text-xs font-bold text-amber-500">{product.reviews.length} Ulasan</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rating Rata-rata</p>
          <p className="text-3xl font-black text-slate-900">{avgRating} <span className="text-xs font-bold text-slate-400">/ 5.0</span></p>
        </div>

        <div className="glass-panel p-6 space-y-2 border-l-4 border-l-blue-400">
          <div className="flex justify-between text-slate-400">
            <BarChart3 size={18} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimasi Omzet</p>
          <p className="text-3xl font-black text-slate-900">
            <span className="text-xs font-bold mr-1 text-slate-400">Rp</span>
            {revenue.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="glass-panel p-6 space-y-2 border-l-4 border-l-emerald-400">
          <div className="flex justify-between text-slate-400">
            <MessageSquare size={18} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diskusi Pelanggan</p>
          <p className="text-3xl font-black text-slate-900">{product.qnas.length} <span className="text-xs font-bold text-slate-400">Pesan</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Product Info Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 md:p-8 space-y-6 sticky top-24">
            <div className="aspect-square w-full rounded-3xl overflow-hidden shadow-inner">
              <SafeImage src={product.imageUrl} alt={product.name} fill className="object-cover" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Kategori</p>
                <p className="font-bold text-slate-800">{product.category}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Slug URL</p>
                <code className="text-xs text-[#FF6B6B] bg-rose-50 px-2 py-1 rounded">/product/{product.slug}</code>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  &quot;{product.description || "Tidak ada deskripsi tersedia."}&quot;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Reviews List */}
        <div className="lg:col-span-8 space-y-8">
          <section className="glass-panel p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <Users size={20} className="text-[#FF6B6B]" /> Daftar Ulasan Masuk
            </h3>

            <div className="space-y-6">
              {product.reviews.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <Star className="mx-auto mb-4 text-slate-200" size={48} />
                  <p className="text-slate-400">Belum ada ulasan untuk produk ini.</p>
                </div>
              ) : (
                product.reviews.map((r) => (
                  <div key={r.id} className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-rose-100 transition-all flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                      <Users size={24} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <h4 className="font-bold text-slate-800">{r.user?.name || "Anonim"}</h4>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed italic">&quot;{r.comment}&quot;</p>
                      <p className="text-[10px] text-slate-300 flex items-center gap-1">
                        <Calendar size={10} /> {new Date(r.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
