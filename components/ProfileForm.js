"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Upload, Camera, Save, Loader2, CheckCircle2, User as UserIcon, Plus, Trash2, Store } from "lucide-react";

export default function ProfileForm({ initialData }) {
  const { update } = useSession();
  const fileInputRef = useRef(null);
  
  const [form, setForm] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    avatar: initialData?.avatar || "",
    bio: initialData?.bio || "",
    description: initialData?.description || "",
    address: initialData?.address || "",
    whatsappNumber: initialData?.whatsappNumber || "",
    operationalHours: initialData?.operationalHours || "",
    employees: Array.isArray(initialData?.employees) && initialData.employees.length
      ? initialData.employees.map((item) => ({
          id: item.id || `new-${Math.random().toString(16).slice(2)}`,
          name: item.name || "",
          role: item.role || "",
          phone: item.phone || ""
        }))
      : [{ id: "new-1", name: "", role: "", phone: "" }]
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

  const addEmployee = () => {
    setForm((prev) => ({
      ...prev,
      employees: [
        ...prev.employees,
        { id: `new-${Math.random().toString(16).slice(2)}`, name: "", role: "", phone: "" }
      ]
    }));
  };

  const removeEmployee = (id) => {
    setForm((prev) => ({
      ...prev,
      employees: prev.employees.filter((employee) => employee.id !== id)
    }));
  };

  const updateEmployee = (id, key, value) => {
    setForm((prev) => ({
      ...prev,
      employees: prev.employees.map((employee) =>
        employee.id === id ? { ...employee, [key]: value } : employee
      )
    }));
  };

  return (
    <section className="rounded-3xl border border-gray-100 bg-white/90 p-6 shadow-xl backdrop-blur-md sm:p-10">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center sm:flex-row gap-6 mb-4">
          <div className="relative group">
            <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-gray-100 bg-slate-50">
              {form.avatar ? (
                <Image src={form.avatar} alt="Profile" fill className="object-cover" unoptimized />
              ) : (
                <UserIcon size={48} className="text-gray-400" />
              )}
              
              <div 
                className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={24} className="text-white mb-1" />
                <span className="text-xs text-white font-medium">Ubah</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h3 className="mb-1 text-lg font-bold text-slate-900">Foto Profil</h3>
            <p className="mb-4 text-sm text-slate-500">Maksimal 2MB. Format: JPG, PNG, GIF.</p>
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
              className="btn btn-ghost inline-flex items-center gap-2 px-4 py-1.5 text-sm"
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

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-slate-500">Nama Lengkap</label>
            <input 
              type="text" 
              className="input" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              required 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-500">Alamat Email</label>
            <input 
              type="email" 
              className="input" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              required 
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white/80 p-4">
          <div className="mb-4 flex items-center gap-2 text-slate-800">
            <Store size={16} />
            <h3 className="m-0 text-base font-semibold">Profil Toko</h3>
          </div>
          <div className="grid gap-4">
            <label className="grid gap-1.5">
              <span className="text-sm text-slate-500">Bio Toko</span>
              <input
                className="input"
                value={form.bio}
                onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Contoh: Warung rumahan dengan menu harian segar"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm text-slate-500">Deskripsi Lengkap</span>
              <textarea
                className="input"
                rows={4}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Ceritakan keunggulan warung Anda"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm text-slate-500">Alamat Lengkap (untuk peta)</span>
              <input
                className="input"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Jl. Contoh No. 123, Jakarta"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-sm text-slate-500">Nomor WhatsApp CS</span>
                <input
                  className="input"
                  value={form.whatsappNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                  placeholder="Contoh: 08123456789"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm text-slate-500">Jam Operasional</span>
                <input
                  className="input"
                  value={form.operationalHours}
                  onChange={(e) => setForm((prev) => ({ ...prev, operationalHours: e.target.value }))}
                  placeholder="Contoh: 08:00 - 22:00"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white/80 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="m-0 text-base font-semibold text-slate-800">Daftar Karyawan</h3>
            <button type="button" className="btn btn-ghost inline-flex items-center gap-2" onClick={addEmployee}>
              <Plus size={14} /> Tambah Karyawan
            </button>
          </div>

          <div className="grid gap-3">
            {form.employees.map((employee) => (
              <div key={employee.id} className="grid gap-2 rounded-xl border border-gray-100 bg-white p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                <input
                  className="input"
                  placeholder="Nama"
                  value={employee.name}
                  onChange={(e) => updateEmployee(employee.id, "name", e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Posisi"
                  value={employee.role || ""}
                  onChange={(e) => updateEmployee(employee.id, "role", e.target.value)}
                />
                <input
                  className="input"
                  placeholder="No. HP"
                  value={employee.phone || ""}
                  onChange={(e) => updateEmployee(employee.id, "phone", e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-ghost inline-flex items-center justify-center text-red-500"
                  onClick={() => removeEmployee(employee.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {status.message && (
          <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${status.type === 'success' ? 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-600' : 'border border-red-500/30 bg-red-500/20 text-red-500'}`}>
            {status.type === 'success' ? <CheckCircle2 size={16} /> : null}
            {status.message}
          </div>
        )}

        <button 
          type="submit" 
          disabled={saving} 
          className="btn mt-2 flex w-full items-center justify-center gap-2 self-end py-3 font-bold sm:w-auto"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </section>
  );
}
