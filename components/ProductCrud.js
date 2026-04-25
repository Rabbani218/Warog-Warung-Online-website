"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import SafeImage from "@/components/SafeImage";
import { Search, Plus, Trash2, Edit3, Clock, Utensils, Loader2, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export default function ProductCrud() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/products", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || "Gagal memuat produk.");
        return;
      }
      setProducts(data);
    } catch (error) {
      toast.error("Gagal terhubung ke server untuk memuat produk.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function removeProduct(id) {
    if (!confirm("Hapus produk ini?")) return;
    setDeleting(id);
    
    toast.promise(async () => {
      const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Gagal menghapus produk.");
      await load();
    }, {
      loading: "Menghapus produk...",
      success: "Produk berhasil dihapus!",
      error: "Gagal menghapus produk."
    }).finally(() => setDeleting(null));
  }

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  return (
    <div className="w-full space-y-8">
      <section className="bg-white/60 backdrop-blur-xl border border-white/40 p-8 md:p-12 rounded-[3rem] shadow-xl shadow-slate-200/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-500 uppercase tracking-widest mb-3 border border-rose-100">
              Katalog Menu
            </span>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Product Management</h3>
            <p className="text-slate-500 font-medium mt-1">Kelola ketersediaan menu dan harga warung Anda.</p>
          </div>
          
          <Link 
            href="/admin/products/create"
            className="px-8 py-4 bg-[#FF6B6B] text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-rose-200 hover:bg-[#ff5252] transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={20} /> TAMBAH MENU BARU
          </Link>
        </div>

        {/* Quick Search */}
        <div className="relative mb-12 group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-rose-500 transition-colors">
            <Search size={22} />
          </div>
          <input 
            type="text" 
            placeholder="Cari menu berdasarkan nama..." 
            className="w-full bg-white/50 border border-slate-100 rounded-[2rem] py-5 pl-16 pr-8 text-lg font-medium focus:ring-4 focus:ring-rose-50 focus:border-rose-200 outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin" />
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Sinkronisasi Katalog...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.article 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={product.id} 
                  className={`group bg-white/70 backdrop-blur-sm border border-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-rose-100/50 transition-all duration-500 flex flex-col ${!product.isAvailable ? 'opacity-70' : ''}`}
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-2xl bg-gray-100">
                    <Image
                      src={product.imageUrl || "/placeholder-image.png"}
                      alt={product.name || "Menu Warung"}
                      fill
                      className="object-contain object-center w-full h-full transition-transform group-hover:scale-110 duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md ${
                        product.isAvailable 
                          ? 'bg-emerald-500/80 text-white border-emerald-300' 
                          : 'bg-slate-500/80 text-white border-slate-300'
                      }`}>
                        {product.isAvailable ? 'Ready' : 'Sold Out'}
                      </span>
                    </div>

                    {/* Quick Actions Hover Overlay */}
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                      <Link 
                        href={`/admin/products/${product.id}/edit`}
                        className="w-12 h-12 bg-white text-slate-900 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0"
                      >
                        <Edit3 size={20} />
                      </Link>
                      <button 
                        onClick={() => removeProduct(product.id)}
                        disabled={deleting === product.id}
                        className="w-12 h-12 bg-white text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-75"
                      >
                        {deleting === product.id ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-4 flex-1 flex flex-col">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                          {product.category || "General"}
                        </span>
                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock size={10} /> {product.preparationTime || 10}m
                        </span>
                      </div>
                      <h4 className="text-slate-900 font-black text-lg leading-tight truncate">{product.name}</h4>
                    </div>
                    
                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed flex-1 italic">
                      {product.description || "Freshly made with traditional recipes."}
                    </p>
                    
                    <div className="pt-4 flex items-end justify-between border-t border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Price Tag</span>
                        <span className="text-xl font-black text-[#FF6B6B]">
                          <small className="text-xs mr-0.5">Rp</small>
                          {Number(product.price).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-200">
                        <Utensils size={20} />
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>

  );
}
