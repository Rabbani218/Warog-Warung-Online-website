import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SafeImage from "@/components/SafeImage";
import ProductTabs from "@/components/ProductTabs";
import { 
  Clock, Tag, Star, ChevronLeft, Utensils, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import ProductActions from "@/components/ProductActions";
import FloatingCartWrapper from "@/components/FloatingCartWrapper";

export default async function ProductDetailPage({ params }) {
  const session = await getServerSession(authOptions);
  
  const product = await prisma.menu.findFirst({
    where: { slug: params.slug },
    include: {
      store: true, // Need store for payment settings
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
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-slate-500 hover:text-[#FF6B6B] font-bold text-sm mb-12 transition-colors group"
            >
              <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:border-rose-100 transition-all">
                <ChevronLeft size={18} />
              </div>
              Kembali ke Menu Utama
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
              {/* Left Column: Product Image */}
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
                </div>
              </div>

              {/* Right Column: Information */}
              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} className={i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                      ))}
                    </div>
                    <span className="text-xs font-black text-slate-400 border-l border-slate-200 pl-4 uppercase tracking-widest">
                      {product.reviews.length} Ulasan
                    </span>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                    {product.name}
                  </h1>

                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-[#FF6B6B]">Rp</span>
                    <span className="text-5xl font-black text-[#FF6B6B] tracking-tighter">
                      {Number(product.price).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center gap-4">
                    <Clock size={24} className="text-slate-400" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Masak</p>
                      <p className="font-bold text-slate-800">{product.preparationTime || 15} Menit</p>
                    </div>
                  </div>
                  <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center gap-4">
                    <Utensils size={24} className="text-[#FF6B6B]" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Porsi</p>
                      <p className="font-bold text-slate-800">Standard</p>
                    </div>
                  </div>
                </div>

                <ProductActions product={product} />

                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-3xl border border-emerald-100/50">
                  <ShieldCheck size={20} className="text-emerald-500" />
                  <p className="text-xs font-bold text-emerald-700">
                    Jaminan rasa dan kebersihan standar Wareb Platinum.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Sidebar on Product Page */}
          <aside className="w-full lg:w-80 xl:w-96">
            <div className="sticky top-28">
              <FloatingCartWrapper />
            </div>
          </aside>
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
