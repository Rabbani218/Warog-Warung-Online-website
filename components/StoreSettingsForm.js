"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Store, MapPin, TextQuote, Save, Loader2, Phone } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function StoreSettingsForm({ initialData }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    bio: initialData?.bio || "",
    address: initialData?.address || "",
    whatsappNumber: initialData?.whatsappNumber || ""
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/store-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Gagal memperbarui pengaturan toko");

      toast.success("Pengaturan Toko berhasil diperbarui!");
      router.refresh();
    } catch (error) {
      toast.error("Gagal memperbarui pengaturan.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-8 md:p-12 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Store size={120} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Pengaturan Toko</h1>
          <p className="text-white/80 font-medium">Ubah identitas warung Anda yang akan tampil di aplikasi pelanggan.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store Name */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Nama Toko / Warung</label>
              <div className="relative">
                <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-slate-700 focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Warung Barokah"
                  required
                />
              </div>
            </div>

            {/* Whatsapp */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">WhatsApp CS (Dukungan Pelanggan)</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-slate-700 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="628123456789"
                />
              </div>
              <p className="text-[10px] text-slate-400 ml-2 italic">* Gunakan format kode negara (contoh: 628...)</p>
            </div>

            {/* Bio/Slogan */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Slogan / Deskripsi Singkat</label>
              <div className="relative">
                <TextQuote size={18} className="absolute left-4 top-4 text-slate-400" />
                <textarea
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-slate-700 focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[100px]"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Kelezatan dalam setiap suapan..."
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Alamat Lengkap Toko</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-4 top-4 text-slate-400" />
                <textarea
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-slate-700 focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[80px]"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Jl. Merdeka No. 123, Jakarta..."
                />
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {loading ? "Menyimpan..." : "Simpan Pengaturan Toko"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
