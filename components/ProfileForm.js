"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Upload, Camera, Save, Loader2, CheckCircle2, User as UserIcon } from "lucide-react";

export default function ProfileForm({ initialData }) {
  const { update } = useSession();
  const fileInputRef = useRef(null);
  
  const [form, setForm] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    avatar: initialData?.avatar || ""
  });
  
  const [status, setStatus] = useState({ type: "", message: "" });
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setStatus({ type: "error", message: "Ukuran gambar maksimal 2MB" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", message: "Profil berhasil diperbarui!" });
        // Update session client-side
        await update({ name: form.name, avatar: form.avatar });
      } else {
        setStatus({ type: "error", message: data.message || "Gagal memperbarui profil." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Terjadi kesalahan sistem." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="glass-panel p-6 sm:p-10">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center sm:flex-row gap-6 mb-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 bg-black/40 flex items-center justify-center relative">
              {form.avatar ? (
                <img src={form.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={48} className="text-gray-500" />
              )}
              
              {/* Overlay on hover */}
              <div 
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={24} className="text-white mb-1" />
                <span className="text-xs text-white font-medium">Ubah</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-white mb-1">Foto Profil</h3>
            <p className="text-sm text-gray-400 mb-4">Maksimal 2MB. Format: JPG, PNG, GIF.</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="glass-btn py-1.5 px-4 text-sm inline-flex items-center gap-2"
            >
              <Upload size={16} /> Unggah Foto
            </button>
            {form.avatar && (
              <button 
                type="button" 
                onClick={() => setForm(prev => ({ ...prev, avatar: "" }))}
                className="ml-2 py-1.5 px-4 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Hapus
              </button>
            )}
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Nama Lengkap</label>
            <input 
              type="text" 
              className="glass-input" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              required 
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Alamat Email</label>
            <input 
              type="email" 
              className="glass-input" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              required 
            />
          </div>
        </div>

        {/* Status Message */}
        {status.message && (
          <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${status.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
            {status.type === 'success' ? <CheckCircle2 size={16} /> : null}
            {status.message}
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={saving} 
          className="glass-btn-primary py-3 w-full sm:w-auto self-end flex items-center justify-center gap-2 font-bold mt-2"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </section>
  );
}
