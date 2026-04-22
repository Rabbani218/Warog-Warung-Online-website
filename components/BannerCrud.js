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
    <div className="w-full space-y-8">
      <section className="bg-white/60 backdrop-blur-xl border border-white/40 p-8 md:p-12 rounded-[3rem] shadow-xl shadow-slate-200/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-500 uppercase tracking-widest mb-3 border border-indigo-100">
              Promotional Ads
            </span>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Banner & Iklan</h3>
            <p className="text-slate-500 font-medium mt-1">Atur promosi yang tampil di halaman depan aplikasi.</p>
          </div>
          
          <Link 
            href="/admin/ads/create"
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={20} /> BUAT IKLAN BARU
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Memuat Promosi...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence>
              {banners.map((banner) => (
                <motion.article 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={banner.id} 
                  className={`group bg-white/70 backdrop-blur-sm border border-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 ${!banner.isActive ? 'opacity-70' : ''}`}
                >
                  <div className="aspect-[21/9] w-full relative overflow-hidden bg-slate-50">
                    <SafeImage 
                      src={banner.imageUrl} 
                      alt={banner.title} 
                      width={1200}
                      height={400}
                      type="ads"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" 
                    />
                    
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md ${
                        banner.isActive 
                          ? 'bg-emerald-500/80 text-white border-emerald-300' 
                          : 'bg-slate-500/80 text-white border-slate-300'
                      }`}>
                        {banner.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                      <Link 
                        href={`/admin/ads/${banner.id}/edit`}
                        className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-indigo-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0"
                      >
                        <Edit3 size={16} /> EDIT BANNER
                      </Link>
                      <button 
                        onClick={() => deleteBanner(banner.id)}
                        disabled={deleting === banner.id}
                        className="w-12 h-12 bg-white text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-75"
                      >
                        {deleting === banner.id ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="p-8 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center">
                        <Megaphone size={16} />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Slot Urutan #{banner.sortOrder}
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-black text-slate-900 leading-tight truncate">{banner.title}</h4>
                    
                    {banner.targetUrl && (
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50/50 px-3 py-2 rounded-xl border border-indigo-100/50">
                        <LinkIcon size={14} />
                        <span className="truncate">{banner.targetUrl}</span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-50 flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Calendar size={12} className="text-slate-300" />
                      <span>{banner.startDate ? new Date(banner.startDate).toLocaleDateString() : 'No Start'}</span>
                      <span className="text-slate-200">/</span>
                      <span>{banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'No End'}</span>
                    </div>
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
