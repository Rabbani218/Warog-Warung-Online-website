"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { Plus, Trash2, Edit3, Link as LinkIcon, Calendar, Loader2, Megaphone } from "lucide-react";
import { toast } from "sonner";

export default function BannerCrud() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/banners", { cache: "no-store" });
      const data = await response.json();
      if (response.ok) setBanners(data);
      else toast.error("Gagal memuat banner.");
    } catch (error) {
      toast.error("Gagal terhubung ke server untuk memuat banner.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function deleteBanner(id) {
    if (!confirm("Hapus iklan ini?")) return;
    setDeleting(id);
    
    toast.promise(async () => {
      const response = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Gagal menghapus banner.");
      setBanners((prev) => prev.filter((item) => item.id !== id));
    }, {
      loading: "Menghapus banner...",
      success: "Banner berhasil dihapus!",
      error: "Gagal menghapus banner."
    }).finally(() => setDeleting(null));
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <section className="glass-panel p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h3 className="retro-title text-2xl text-slate-900 mb-1">Banner & Iklan</h3>
            <p className="text-slate-500 text-sm">Atur promosi yang tampil di halaman depan aplikasi.</p>
          </div>
          
          <Link 
            href="/admin/ads/create"
            className="glass-btn-primary flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl shadow-xl shadow-rose-100 whitespace-nowrap"
          >
            <Plus size={20} /> Buat Iklan Baru
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-rose-400" size={40} />
            <p className="text-slate-400 font-medium">Memuat promosi...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {banners.map((banner) => (
                <motion.article 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={banner.id} 
                  className={`glass-panel card-fix shadow-rose-50/50 group relative ${!banner.isActive ? 'opacity-70 grayscale-[0.5]' : ''}`}
                >
                  <div className="aspect-[21/9] w-full relative overflow-hidden bg-slate-100">
                    <SafeImage 
                      src={banner.imageUrl} 
                      alt={banner.title} 
                      fill 
                      type="ads"
                      className="object-cover transition-transform group-hover:scale-105 duration-700" 
                    />
                    
                    <div className="absolute top-3 left-3 z-10">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border ${
                        banner.isActive 
                          ? 'bg-emerald-500/80 text-white border-emerald-400' 
                          : 'bg-slate-500/80 text-white border-slate-400'
                      }`}>
                        {banner.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 gap-2">
                      <Link 
                        href={`/admin/ads/${banner.id}/edit`}
                        className="flex-1 bg-white/90 hover:bg-white text-slate-900 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 backdrop-blur-md transition-all translate-y-4 group-hover:translate-y-0 duration-300"
                      >
                        <Edit3 size={14} /> Edit Iklan
                      </Link>
                      <button 
                        className="bg-rose-500/90 hover:bg-rose-500 text-white p-2 rounded-xl backdrop-blur-md transition-all translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                        onClick={() => deleteBanner(banner.id)}
                        disabled={deleting === banner.id}
                      >
                        {deleting === banner.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="p-5 bg-white/40">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                        Banner #{banner.sortOrder}
                      </span>
                    </div>
                    <h4 className="text-slate-900 font-bold text-lg mb-2 leading-tight truncate">{banner.title}</h4>
                    
                    {banner.targetUrl && (
                      <p className="text-slate-400 text-[10px] flex items-center gap-1 mb-3">
                        <LinkIcon size={10} /> <span className="truncate">{banner.targetUrl}</span>
                      </p>
                    )}

                    {(banner.startDate || banner.endDate) && (
                      <div className="pt-3 border-t border-slate-100 flex items-center gap-4 text-[10px] text-slate-500 font-medium">
                        <div className="flex items-center gap-1">
                          <Calendar size={10} />
                          {banner.startDate ? new Date(banner.startDate).toLocaleDateString() : 'Always'}
                        </div>
                        <span>→</span>
                        <div>
                          {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'Forever'}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
            {banners.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                  <Megaphone size={24} className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium">Belum ada banner iklan.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
