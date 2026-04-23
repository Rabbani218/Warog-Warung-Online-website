"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Mail, Lock, LogIn, UserPlus, 
  ArrowRight, ShieldCheck, User, 
  Heart, Sparkles, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

export default function ClientAuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await signIn("credentials", {
          email: form.email.trim().toLowerCase(),
          password: form.password,
          redirect: false,
        });

        if (res?.error) {
          toast.error("Login gagal: Periksa email dan sandi Anda");
        } else {
          toast.success("Selamat Datang Kembali!");
          setTimeout(() => {
            onClose();
            window.location.reload();
          }, 500);
        }

      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
            role: "USER" 
          }),
        });
        
        const data = await res.json();
        if (res.ok) {
          toast.success("Akun berhasil dibuat! Silakan masuk.");
          setMode("login");
        } else {
          toast.error(data.message || data.error || "Gagal mendaftar.");
        }
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop - High quality blur */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
        />

        {/* Modal Container - Responsive & Elegant */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          className="relative w-full max-w-4xl bg-white/95 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col md:flex-row min-h-[500px]"
        >
          {/* Left Side: Branding & Illustration */}
          <div className="w-full md:w-5/12 bg-gradient-to-br from-[#FF6B6B] to-[#ff8e8e] p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-lg">
                <Heart size={28} className="fill-white" />
              </div>
              <h2 className="text-3xl font-black tracking-tight leading-tight mb-4">
                Warung Digital <br /> Penuh Cinta.
              </h2>
              <p className="text-rose-50/80 text-sm leading-relaxed">
                Masuk untuk memesan menu favoritmu dan kumpulkan poin setiap transaksi.
              </p>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
                <span className="text-xs font-bold">Pemesanan Instan</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <span className="text-xs font-bold">Promo Member Khusus</span>
              </div>
            </div>
          </div>

          {/* Right Side: Auth Form */}
          <div className="w-full md:w-7/12 p-8 md:p-12 bg-white relative">
            <button 
              onClick={onClose}
              className="absolute right-8 top-8 p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            {/* Form Toggle */}
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 mb-8 max-w-[300px] mx-auto md:mx-0">
              <button 
                onClick={() => setMode("login")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${mode === "login" ? 'bg-white shadow-md text-[#FF6B6B]' : 'text-slate-400'}`}
              >
                MASUK
              </button>
              <button 
                onClick={() => setMode("register")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${mode === "register" ? 'bg-white shadow-md text-[#FF6B6B]' : 'text-slate-400'}`}
              >
                DAFTAR
              </button>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {mode === "login" ? "Selamat Datang!" : "Mulai Sekarang"}
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                {mode === "login" ? "Senang melihat Anda kembali di Wareb." : "Lengkapi data di bawah untuk membuat akun baru."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "register" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-4 focus:ring-rose-50 focus:border-rose-200 outline-none transition-all font-medium"
                      placeholder="Masukkan nama Anda"
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      required={mode === "register"}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="email"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-4 focus:ring-rose-50 focus:border-rose-200 outline-none transition-all font-medium"
                    placeholder="email@anda.com"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="password"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-4 focus:ring-rose-50 focus:border-rose-200 outline-none transition-all font-medium"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({...form, password: e.target.value})}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4.5 bg-[#FF6B6B] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-[#ff5252] transition-all shadow-xl shadow-rose-100 active:scale-95 disabled:opacity-50"
              >
                {loading ? "Memproses..." : (mode === "login" ? "MASUK SEKARANG" : "DAFTAR AKUN")}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            {/* Social Login Divider */}
            <div className="relative flex items-center py-8">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Atau</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* Google Login */}
            <button 
              onClick={() => signIn("google")}
              className="w-full py-4 px-6 border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 font-bold text-slate-600 hover:bg-slate-50 hover:border-rose-100 transition-all active:scale-95"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              Lanjutkan dengan Google
            </button>

            <div className="mt-8 text-center flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <ShieldCheck size={14} className="text-emerald-500" />
              Keamanan Data Terjamin
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
