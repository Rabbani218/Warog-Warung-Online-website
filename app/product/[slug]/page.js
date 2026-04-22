import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SafeImage from "@/components/SafeImage";
import ProductTabs from "@/components/ProductTabs";
import { 
  ShoppingBag, Clock, Tag, Star, ChevronLeft, Share2, 
  ChefHat, Utensils, Zap 
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }) {
  const session = await getServerSession(authOptions);
  
  const product = await prisma.menu.findFirst({
    where: { slug: params.slug },
    include: {
      reviews: {
        include: { user: true },
        orderBy: { createdAt: "desc" }
      },
      qnas: {
        include: { user: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!product) notFound();

  const avgRating = product.reviews.length > 0 
    ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
    : "0";

  return (
    <main className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-[#FF6B6B] font-bold text-sm mb-8 transition-colors group"
        >
          <div className="p-1.5 rounded-full bg-white shadow-sm border border-slate-100 group-hover:border-rose-100 transition-all">
            <ChevronLeft size={18} />
          </div>
          Kembali ke Menu Utama
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Media Area */}
          <div className="lg:col-span-7 space-y-6">
            <div className="aspect-square w-full rounded-[3rem] overflow-hidden glass-panel relative group">
              <SafeImage 
                src={product.imageUrl} 
                alt={product.name} 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute top-6 left-6 flex flex-col gap-3">
                <span className="badge-premium flex items-center gap-1.5 shadow-xl bg-white/90">
                  <Tag size={12} className="text-[#FF6B6B]" /> {product.category}
                </span>
                {product.isAvailable ? (
                  <span className="px-4 py-1.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg">
                    Tersedia Sekarang
                  </span>
                ) : (
                  <span className="px-4 py-1.5 rounded-full bg-slate-500/90 text-white text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg">
                    Stok Habis
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Info Area */}
          <div className="lg:col-span-5 space-y-8">
            <header className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-400 border-l border-slate-200 pl-2">
                  {product.reviews.length} Ulasan
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-[#FF6B6B]">Rp</span>
                <span className="text-4xl font-black text-[#FF6B6B]">
                  {Number(product.price).toLocaleString("id-ID")}
                </span>
              </div>
            </header>

            <div className="glass-panel p-6 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-500">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Waktu Masak</p>
                    <p className="font-bold text-slate-700">{product.preparationTime || 10} Menit</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-500">
                    <ChefHat size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Tingkat Kesulitan</p>
                    <p className="font-bold text-slate-700">Expert Choice</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Utensils size={20} className="text-[#FF6B6B]" /> Deskripsi Menu
              </h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {product.description || "Nikmati kelezatan menu otentik kami yang dibuat dengan bahan pilihan terbaik dan resep rahasia turun-temurun."}
              </p>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <button 
                className="flex-[2] py-5 bg-[#FF6B6B] text-white rounded-[2rem] font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#ff5252] transition-all shadow-2xl shadow-rose-200 disabled:opacity-50 group"
                disabled={!product.isAvailable}
              >
                <ShoppingBag size={24} className="group-hover:rotate-12 transition-transform" />
                Tambah ke Keranjang
              </button>
              <button className="flex-1 py-5 bg-white border border-slate-100 text-slate-400 rounded-[2rem] font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                <Share2 size={20} />
              </button>
            </div>

            <div className="flex items-center gap-4 py-6 border-t border-slate-100">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    U{i}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic">
                <span className="text-[#FF6B6B] font-bold">+12 orang</span> baru saja memesan menu ini
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Area: Reviews & QnA */}
        <ProductTabs 
          menuId={product.id} 
          reviews={product.reviews} 
          qnas={product.qnas}
          session={session}
        />
      </div>
    </main>
  );
}
