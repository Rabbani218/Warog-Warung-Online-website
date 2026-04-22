"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
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
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <section className="glass-panel p-6 md:p-8">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <span className="badge">Katalog Menu</span>
          <h3 className="retro-title text-3xl text-slate-900">Product Catalog</h3>
          <p className="text-slate-500 max-w-lg">Kelola ketersediaan menu, harga, dan informasi katalog warung Anda secara real-time.</p>
        </div>

        {/* Quick Search & Filter */}
        <div className="flex justify-center mb-10">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari menu berdasarkan nama..." 
              className="glass-input pl-12 py-4 text-lg shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Add Form Section */}
        <div className="mb-12 p-1 bg-slate-50 rounded-[2rem] border border-slate-200/60 shadow-inner">
          <div className="glass-panel p-6 flex flex-col md:flex-row items-center gap-4">
             <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                <input placeholder="Nama Menu" className="glass-input bg-white" />
                <input placeholder="Slug" className="glass-input bg-white" />
                <input placeholder="Harga" type="number" className="glass-input bg-white" />
                <input placeholder="Image URL" className="glass-input bg-white" />
             </div>
             <Link 
              href="/admin/products/create"
              className="glass-btn-primary w-full md:w-auto px-8 py-3 rounded-2xl flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Tambah Menu
            </Link>
          </div>
          <p className="text-[10px] text-center py-2 text-slate-400 font-medium italic">
            Tip: Klik &apos;Tambah Menu&apos; untuk membuka formulir detail lengkap (Kategori, Waktu Masak, Deskripsi).
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-rose-400" size={40} />
            <p className="text-slate-400 font-medium">Menyinkronkan katalog...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.article 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={product.id} 
                  className={`glass-panel card-fix shadow-rose-50/50 group relative ${!product.isAvailable ? 'opacity-75 grayscale-[0.5]' : ''}`}
                >
                  <div className="aspect-square w-full relative overflow-hidden bg-slate-100">
                    <SafeImage 
                      src={product.imageUrl} 
                      alt={product.name} 
                      fill 
                      type="menu"
                      className="object-cover transition-transform group-hover:scale-110 duration-700" 
                    />
                    
                    <div className="absolute top-3 left-3 z-10">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border ${
                        product.isAvailable 
                          ? 'bg-emerald-500/80 text-white border-emerald-400' 
                          : 'bg-slate-500/80 text-white border-slate-400'
                      }`}>
                        {product.isAvailable ? 'Tersedia' : 'Habis'}
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 gap-2">
                      <Link 
                        href={`/admin/products/${product.id}`}
                        className="bg-emerald-500/90 hover:bg-emerald-500 text-white p-2 rounded-xl backdrop-blur-md transition-all translate-y-4 group-hover:translate-y-0 duration-300"
                        title="Analytics"
                      >
                        <BarChart3 size={14} />
                      </Link>
                      <Link 
                        href={`/admin/products/${product.id}/edit`}
                        className="flex-1 bg-white/90 hover:bg-white text-slate-900 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 backdrop-blur-md transition-all translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                      >
                        <Edit3 size={14} /> Edit
                      </Link>
                      <button 
                        className="bg-rose-500/90 hover:bg-rose-500 text-white p-2 rounded-xl backdrop-blur-md transition-all translate-y-4 group-hover:translate-y-0 duration-300 delay-100"
                        onClick={() => removeProduct(product.id)}
                        disabled={deleting === product.id}
                      >
                        {deleting === product.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between bg-white/40">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                          {product.category || "Menu"}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <Clock size={10} /> {product.preparationTime || 10}&apos;
                        </div>
                      </div>
                      <h4 className="text-slate-900 font-bold text-lg mb-1 leading-tight">{product.name}</h4>
                      <p className="text-slate-500 text-xs mb-4 line-clamp-2 leading-relaxed">
                        {product.description || "Tanpa deskripsi"}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <p className="text-[#FF6B6B] font-black text-xl">
                        <span className="text-xs font-bold mr-0.5">Rp</span>
                        {Number(product.price).toLocaleString("id-ID")}
                      </p>
                      <Utensils size={18} className="text-slate-200" />
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                  <Search size={32} className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium">Tidak ada produk ditemukan.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
