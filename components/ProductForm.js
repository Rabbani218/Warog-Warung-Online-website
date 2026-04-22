"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Save, X, Info, DollarSign, Clock, Image as ImageIcon, 
  ChevronRight, ArrowLeft, Loader2, Sparkles, AlertCircle 
} from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { toast } from "sonner";
import { upsertProductAction } from "@/app/(admin)/admin/products/actions";

export default function ProductForm({ initialData = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialData || {
    name: "",
    slug: "",
    description: "",
    price: "",
    category: "Makanan",
    preparationTime: 10,
    imageUrl: "",
    isAvailable: true,
    isActive: true
  });

  // Auto-generate slug
  useEffect(() => {
    if (!initialData && form.name) {
      const slug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setForm(prev => ({ ...prev, slug }));
    }
  }, [form.name, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await upsertProductAction(form);
      if (result.success) {
        toast.success(initialData ? "Produk diperbarui!" : "Produk berhasil dibuat!");
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(result.message || "Gagal menyimpan produk.");
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
            {initialData ? "Edit Produk" : "Tambah Produk Baru"}
          </h1>
          <p className="text-slate-500 text-sm">Lengkapi detail informasi menu di bawah ini.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Section: Informasi Dasar */}
          <section className="glass-panel p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 text-[#FF6B6B] border-b border-slate-100 pb-4 mb-6">
              <Info size={20} />
              <h2 className="font-bold text-lg">Informasi Dasar</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nama Menu</label>
                  <input 
                    className="glass-input"
                    placeholder="Contoh: Nasi Goreng Spesial"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                    Slug <Sparkles size={12} className="text-amber-500" />
                  </label>
                  <input 
                    className="glass-input bg-slate-50/50"
                    placeholder="nasi-goreng-spesial"
                    value={form.slug}
                    onChange={(e) => setForm({...form, slug: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Deskripsi Lengkap</label>
                <textarea 
                  className="glass-input min-h-[120px] py-3"
                  placeholder="Ceritakan kelezatan menu ini kepada pelanggan..."
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                />
              </div>
            </div>
          </section>

          {/* Section: Detail Penjualan */}
          <section className="glass-panel p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 text-[#FF6B6B] border-b border-slate-100 pb-4 mb-6">
              <DollarSign size={20} />
              <h2 className="font-bold text-lg">Detail Penjualan</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Harga (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                  <input 
                    type="number"
                    className="glass-input pl-12"
                    placeholder="0"
                    value={form.price}
                    onChange={(e) => setForm({...form, price: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Kategori</label>
                <select 
                  className="glass-input appearance-none"
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                >
                  <option value="Makanan">Makanan</option>
                  <option value="Minuman">Minuman</option>
                  <option value="Cemilan">Cemilan</option>
                  <option value="Penutup">Penutup</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section: Operasional Dapur */}
          <section className="glass-panel p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 text-[#FF6B6B] border-b border-slate-100 pb-4 mb-6">
              <Clock size={20} />
              <h2 className="font-bold text-lg">Operasional Dapur</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Estimasi Waktu (Menit)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range"
                    min="1"
                    max="60"
                    step="1"
                    className="flex-1 accent-[#FF6B6B]"
                    value={form.preparationTime}
                    onChange={(e) => setForm({...form, preparationTime: e.target.value})}
                  />
                  <span className="w-16 text-center font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                    {form.preparationTime}'
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">Status Ketersediaan</p>
                  <p className="text-xs text-slate-500">Matikan jika stok bahan habis.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({...form, isAvailable: !form.isAvailable})}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${form.isAvailable ? 'bg-[#FF6B6B]' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${form.isAvailable ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Section: Media */}
          <section className="glass-panel p-6 md:p-8 space-y-6 sticky top-8">
            <div className="flex items-center gap-2 text-[#FF6B6B] border-b border-slate-100 pb-4 mb-6">
              <ImageIcon size={20} />
              <h2 className="font-bold text-lg">Media & Preview</h2>
            </div>

            <div className="space-y-6">
              <div className="aspect-square rounded-3xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200">
                <SafeImage 
                  src={form.imageUrl} 
                  alt={form.name || "Preview"} 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Image URL</label>
                <input 
                  className="glass-input text-xs"
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={(e) => setForm({...form, imageUrl: e.target.value})}
                />
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                <AlertCircle className="text-amber-500 shrink-0" size={18} />
                <p className="text-[10px] text-amber-700 leading-relaxed">
                  Gunakan URL gambar berkualitas tinggi (PNG/JPG). Pastikan link dapat diakses secara publik.
                </p>
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
            {initialData ? "Simpan Perubahan" : "Simpan Produk"}
          </button>
        </div>
      </motion.div>
    </form>
  );
}
