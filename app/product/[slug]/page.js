import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SafeImage from "@/components/SafeImage";
import ProductTabs from "@/components/ProductTabs";
import { 
  ShoppingBag, Clock, Tag, Star, ChevronLeft, Share2, 
  ChefHat, Utensils, Info, ShieldCheck
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
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-[#FF6B6B] font-bold text-sm mb-12 transition-colors group"
        >
          <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:border-rose-100 transition-all">
            <ChevronLeft size={18} />
          </div>
          Kembali ke Menu Utama
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Product Image */}
          <div className="lg:col-span-6 xl:col-span-7">
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-white shadow-2xl shadow-slate-200 group border border-slate-100">
              <SafeImage 
                src={product.imageUrl} 
                alt={product.name} 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute top-8 left-8 flex flex-col gap-3">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg text-[10px] font-black uppercase tracking-widest text-slate-900 border border-white/20">
                  <Tag size={12} className="text-[#FF6B6B]" /> {product.category}
                </span>
                <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-xl shadow-lg border border-white/20 ${
                  product.isAvailable ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                }`}>
                  {product.isAvailable ? 'Tersedia Sekarang' : 'Stok Habis'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Information */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className={i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                  ))}
                </div>
                <span className="text-xs font-black text-slate-400 border-l border-slate-200 pl-4 uppercase tracking-widest">
                  {product.reviews.length} Ulasan Terverifikasi
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-[#FF6B6B]">Rp</span>
                <span className="text-5xl font-black text-[#FF6B6B] tracking-tighter">
                  {Number(product.price).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Masak</p>
                  <p className="font-bold text-slate-800 leading-none">{product.preparationTime || 15} Menit</p>
                </div>
              </div>
              <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 text-[#FF6B6B] rounded-2xl flex items-center justify-center">
                  <Utensils size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Porsi</p>
                  <p className="font-bold text-slate-800 leading-none">Standard</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Info size={14} className="text-[#FF6B6B]" /> Deskripsi Menu
              </h3>
              <p className="text-slate-500 leading-relaxed text-lg font-medium">
                {product.description || "Kelezatan otentik yang disiapkan dengan cinta dan bahan-bahan segar setiap hari."}
              </p>
            </div>

            <div className="pt-8 space-y-6">
              <div className="flex gap-4">
                <button 
                  className="flex-1 py-6 bg-[#FF6B6B] hover:bg-[#ff5252] text-white rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-rose-200 transition-all active:scale-95 disabled:opacity-50 group"
                  disabled={!product.isAvailable}
                >
                  <ShoppingBag size={24} className="group-hover:rotate-12 transition-transform" />
                  Pesan Sekarang
                </button>
                <button className="w-20 bg-white border border-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all hover:shadow-lg">
                  <Share2 size={24} />
                </button>
              </div>

              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-3xl border border-emerald-100/50">
                <ShieldCheck size={20} className="text-emerald-500" />
                <p className="text-xs font-bold text-emerald-700">
                  Jaminan rasa dan kebersihan standar Wareb Platinum.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Section */}
        <div className="mt-24">
          <ProductTabs 
            menuId={product.id} 
            reviews={product.reviews} 
            qnas={product.qnas}
            session={session}
          />
        </div>
      </div>
    </main>
  );
}
