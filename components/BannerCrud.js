"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Plus, Trash2, Link as LinkIcon } from "lucide-react";

const defaultBanner = {
  title: "",
  imageUrl: "",
  targetUrl: "",
  sortOrder: 0,
  isActive: true
};

import { toast } from "sonner";

export default function BannerCrud() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(defaultBanner);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const response = await fetch("/api/admin/banners", { cache: "no-store" });
      const data = await response.json();
      if (response.ok) setBanners(data);
      else toast.error("Gagal memuat banner.");
    } catch (error) {
      toast.error("Gagal terhubung ke server untuk memuat banner.");
    }
  }

  useEffect(() => { load(); }, []);

  async function createBanner(event) {
    event.preventDefault();
    setSaving(true);
    
    toast.promise(async () => {
      const response = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error("Gagal menambah banner.");
      setBanners((prev) => [...prev, data]);
      setForm(defaultBanner);
    }, {
      loading: "Menambah banner...",
      success: "Banner berhasil ditambahkan!",
      error: "Gagal menambah banner."
    }).finally(() => setSaving(false));
  }

  async function deleteBanner(id) {
    toast.promise(async () => {
      const response = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Gagal menghapus banner.");
      setBanners((prev) => prev.filter((item) => item.id !== id));
    }, {
      loading: "Menghapus banner...",
      success: "Banner berhasil dihapus!",
      error: "Gagal menghapus banner."
    });
  }

  return (
    <section className="glass-panel p-6">
      <h3 className="retro-title text-xl text-slate-900 mb-6">Banner & Ads</h3>
      
      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 bg-black/5 p-4 rounded-xl border border-slate-200" onSubmit={createBanner}>
        <input className="glass-input lg:col-span-1" placeholder="Judul banner" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input className="glass-input lg:col-span-1" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required />
        <input className="glass-input lg:col-span-1" placeholder="Target URL (opsional)" value={form.targetUrl} onChange={(e) => setForm({ ...form, targetUrl: e.target.value })} />
        <input className="glass-input lg:col-span-1" type="number" placeholder="Sort order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
        <button className="glass-btn-primary flex items-center justify-center gap-2 lg:col-span-1" type="submit" disabled={saving}>
          <Plus size={18} /> {saving ? "..." : "Tambah"}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {banners.map((banner) => (
            <motion.article 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={banner.id} 
              className="glass-panel card-fix shadow-rose-50/50"
            >
              <div className="h-48 w-full relative overflow-hidden">
                <Image src={banner.imageUrl} alt={banner.title} fill className="img-fix opacity-90 hover:opacity-100" />
                <button 
                  className="absolute top-2 right-2 z-20 p-2 bg-rose-500/80 hover:bg-rose-500 text-white rounded-full backdrop-blur-md shadow-lg transition-all"
                  onClick={() => deleteBanner(banner.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="p-4 bg-white/40">
                <h4 className="text-slate-900 font-bold text-lg mb-1">{banner.title}</h4>
                {banner.targetUrl && (
                  <p className="text-[#FF6B6B] text-xs flex items-center gap-1 font-semibold">
                    <LinkIcon size={12} /> <span className="truncate">{banner.targetUrl}</span>
                  </p>
                )}
                <div className="mt-3 flex justify-between items-center text-xs text-slate-500">
                  <span>Urutan: {banner.sortOrder}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${banner.isActive ? 'bg-emerald-500/20 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>
                    {banner.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
        {banners.length === 0 && <p className="text-slate-500 col-span-full text-center py-4">Tidak ada banner.</p>}
      </div>
    </section>
  );
}
