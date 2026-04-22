"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, X, ImageIcon, Link as LinkIcon, Calendar, Loader2, ArrowLeft } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { toast } from "sonner";
import { upsertAdAction } from "@/app/(admin)/admin/ads/actions";

export default function AdForm({ initialData = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialData || {
    title: "",
    imageUrl: "",
    targetUrl: "",
    sortOrder: 0,
    isActive: true,
    startDate: "",
    endDate: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await upsertAdAction(form);
      if (result.success) {
        toast.success(initialData ? "Banner diperbarui!" : "Banner berhasil dibuat!");
        router.push("/admin/products"); // Redirect to the list view
        router.refresh();
      } else {
        toast.error(result.message || "Gagal menyimpan banner.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative pb-32">
      <div className="flex items-center gap-4 mb-8">
        <button 
          type="button"
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {initialData ? "Edit Iklan" : "Buat Iklan Baru"}
          </h1>
          <p className="text-slate-500 text-sm">Banner promo akan tampil di carousel halaman depan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-panel p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 text-[#FF6B6B] border-b border-slate-100 pb-4 mb-6">
              <ImageIcon size={20} />
              <h2 className="font-bold text-lg">Detail Konten</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Judul Banner</label>
                <input 
                  className="glass-input"
                  placeholder="Contoh: Promo Ramadhan Berkah"
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <LinkIcon size={14} /> URL Target (Opsional)
                  </label>
                  <input 
                    className="glass-input"
                    placeholder="https://..."
                    value={form.targetUrl}
                    onChange={(e) => setForm({...form, targetUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Urutan Tampil</label>
                  <input 
                    type="number"
                    className="glass-input"
                    value={form.sortOrder}
                    onChange={(e) => setForm({...form, sortOrder: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="glass-panel p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 text-[#FF6B6B] border-b border-slate-100 pb-4 mb-6">
              <Calendar size={20} />
              <h2 className="font-bold text-lg">Penjadwalan (Opsional)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Mulai Iklan</label>
                <input 
                  type="date"
                  className="glass-input"
                  value={form.startDate}
                  onChange={(e) => setForm({...form, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Selesai Iklan</label>
                <input 
                  type="date"
                  className="glass-input"
                  value={form.endDate}
                  onChange={(e) => setForm({...form, endDate: e.target.value})}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="glass-panel p-6 md:p-8 space-y-6 sticky top-8">
            <div className="flex items-center gap-2 text-[#FF6B6B] border-b border-slate-100 pb-4 mb-6">
              <ImageIcon size={20} />
              <h2 className="font-bold text-lg">Preview Visual</h2>
            </div>

            <div className="space-y-6">
              <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200">
                <SafeImage 
                  src={form.imageUrl} 
                  alt="Banner Preview" 
                  className="w-full h-full object-cover"
                  type="ads"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Image URL</label>
                <input 
                  className="glass-input text-xs"
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={(e) => setForm({...form, imageUrl: e.target.value})}
                  required
                />
              </div>

              <div className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div className="flex-1">
                  <p className="text-sm font-bold text-emerald-800">Status Aktif</p>
                  <p className="text-[10px] text-emerald-600">Tampilkan iklan di aplikasi.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({...form, isActive: !form.isActive})}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${form.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${form.isActive ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-4xl z-50"
      >
        <div className="glass-panel px-6 py-4 flex items-center justify-between gap-4 shadow-2xl border-t border-white/50">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-all"
          >
            Batal
          </button>
          
          <button 
            type="submit"
            disabled={loading}
            className="flex-1 md:flex-none px-10 py-3 bg-[#FF6B6B] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#ff5252] transition-all shadow-xl shadow-rose-200 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {initialData ? "Simpan Perubahan" : "Simpan Iklan"}
          </button>
        </div>
      </motion.div>
    </form>
  );
}
