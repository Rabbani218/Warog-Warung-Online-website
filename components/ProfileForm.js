"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { User, Mail, MapPin, Heart, Utensils, TextQuote, Save, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";

export default function ClientProfileForm() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    bio: session?.user?.bio || "",
    address: session?.user?.address || "",
    hobbies: session?.user?.hobbies || "",
    favoriteFood: session?.user?.favoriteFood || "",
    avatar: session?.user?.avatar || ""
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/client/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();
      
      // Update next-auth session
      await update({
        ...session,
        user: {
          ...session?.user,
          ...formData
        }
      });

      toast.success("Profil berhasil diperbarui!");
    } catch (error) {
      toast.error("Gagal memperbarui profil.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#FF6B6B] to-[#ff8e8e] p-8 md:p-12 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <User size={120} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Profil Pelanggan</h1>
          <p className="text-white/80 font-medium">Lengkapi data dirimu untuk pengalaman yang lebih personal.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-slate-300" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-[#FF6B6B] text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-all border-4 border-white">
                <Camera size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Ketuk untuk ubah foto</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Nama Lengkap</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-slate-700 focus:ring-2 focus:ring-[#FF6B6B]/20 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama anda"
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-2 opacity-60">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Email (Permanen)</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-12 pr-6 text-slate-500 cursor-not-allowed"
                  value={session?.user?.email || ""}
                  disabled
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Tentang Saya (Bio)</label>
              <div className="relative">
                <TextQuote size={18} className="absolute left-4 top-4 text-slate-400" />
                <textarea
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-slate-700 focus:ring-2 focus:ring-[#FF6B6B]/20 transition-all min-h-[100px]"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Ceritakan sedikit tentang dirimu..."
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Alamat Pengiriman</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-4 top-4 text-slate-400" />
                <textarea
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-slate-700 focus:ring-2 focus:ring-[#FF6B6B]/20 transition-all min-h-[80px]"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Alamat lengkap rumah atau kantor..."
                />
              </div>
            </div>

            {/* Hobbies */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Hobi</label>
              <div className="relative">
                <Heart size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-slate-700 focus:ring-2 focus:ring-[#FF6B6B]/20 transition-all"
                  value={formData.hobbies}
                  onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                  placeholder="Olahraga, Game, Musik..."
                />
              </div>
            </div>

            {/* Favorite Food */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Makanan Favorit</label>
              <div className="relative">
                <Utensils size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-slate-700 focus:ring-2 focus:ring-[#FF6B6B]/20 transition-all"
                  value={formData.favoriteFood}
                  onChange={(e) => setFormData({ ...formData, favoriteFood: e.target.value })}
                  placeholder="Nasi Goreng, Rendang, etc..."
                />
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6B6B] hover:bg-[#ff5252] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B6B]/20 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
