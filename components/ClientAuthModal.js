"use client";

import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { X, Mail, Lock, Loader2, User, UserPlus } from "lucide-react";
import { toast } from "sonner";

/**
 * ClientAuthModal - A modern, glassmorphic login/register portal.
 * Theme: Soft Crimson & Slate
 */
export default function ClientAuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  }

  // ── Register then auto-login ──────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create account via API
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name?.trim(),
          email: email?.trim().toLowerCase(),
          password,
          role: "USER", // Default role as per requirements
        }),
      });

      const data = await registerRes.json().catch(() => ({}));

      if (!registerRes.ok) {
        throw new Error(data?.error || data?.message || "Registrasi gagal.");
      }

      toast.success("Akun berhasil dibuat! Sedang masuk…", {
        style: { background: "#fff5f5", color: "#e53e3e", border: "1px solid #feb2b2" }
      });

      // 2. Auto-login after registration
      const res = await signIn("credentials", {
        redirect: false,
        email: email?.trim().toLowerCase(),
        password,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      toast.success("Selamat datang di Wareb!");
      onClose(true);
    } catch (err) {
      const message = err?.message || "Terjadi kesalahan saat registrasi.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  // ── Credentials Login ─────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email?.trim().toLowerCase(),
        password,
      });

      if (!res) {
        setError("Tidak ada respons dari server. Coba lagi.");
        return;
      }

      if (res.error) {
        setError(res.error);
        toast.error(res.error);
        return;
      }

      toast.success("Login berhasil! Senang melihat Anda kembali.");
      onClose(true);
    } catch (err) {
      const message = err?.message || "Terjadi kesalahan saat login.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  // ── Google OAuth ──────────────────────────────────────────────────
  async function handleGoogleLogin() {
    setLoading(true);
    setError("");

    try {
      // Direct call to GoogleProvider without manual overrides to avoid mismatch
      await signIn("google", {
        callbackUrl: window.location.href,
      });
    } catch (err) {
      console.error("[ClientAuth] Google login error:", err);
      toast.error("Login Google gagal. Pastikan Authorized Redirect URI di Google Cloud Console sudah benar.");
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onClose()}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="glass-card overflow-hidden rounded-[3rem] relative bg-white/90 shadow-[0_32px_64px_-16px_rgba(229,62,62,0.15)] border border-white/60 w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto pointer-events-auto custom-scrollbar">
              
              {/* Close Button */}
              <button
                onClick={() => onClose()}
                className="absolute right-8 top-8 text-slate-400 hover:text-rose-500 transition-all z-10 p-2 hover:bg-rose-50 rounded-full active:scale-90"
              >
                <X size={22} />
              </button>

              <div className="p-8 md:p-12">
                {/* Header Section */}
                <div className="text-center mb-8">
                  <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-20 h-20 bg-gradient-to-br from-rose-50 to-rose-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner"
                  >
                    {mode === "login" ? (
                      <Lock className="text-[#FF6B6B]" size={36} />
                    ) : (
                      <UserPlus className="text-[#FF6B6B]" size={36} />
                    )}
                  </motion.div>
                  <h2 className="text-3xl font-[900] text-slate-900 mb-2 tracking-tight">
                    {mode === "login" ? "Masuk ke Akun" : "Bergabung Sekarang"}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed px-2">
                    {mode === "login"
                      ? "Akses pesanan Anda dan berikan ulasan terbaik untuk menu kami."
                      : "Daftar gratis untuk menikmati kemudahan pemesanan digital."}
                  </p>
                </div>

                {/* Mode Switcher Tabs */}
                <div className="flex gap-2 p-1.5 bg-slate-100/60 rounded-2xl mb-8 border border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setError(""); }}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all ${
                      mode === "login"
                        ? "bg-white text-rose-500 shadow-sm"
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                    }`}
                  >
                    Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode("register"); setError(""); }}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all ${
                      mode === "register"
                        ? "bg-white text-rose-500 shadow-sm"
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                    }`}
                  >
                    Daftar
                  </button>
                </div>

                {/* Social Login Section */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full bg-white text-slate-700 border border-slate-200 hover:border-rose-200 hover:bg-rose-50/40 font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {loading ? "Menghubungkan…" : mode === "login" ? "Masuk dengan Google" : "Daftar dengan Google"}
                </button>

                <div className="relative flex items-center justify-center my-8">
                  <div className="border-t border-slate-100 w-full"></div>
                  <span className="bg-[#fffdfd] px-5 text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 absolute">atau</span>
                </div>

                {/* Credentials Form Section */}
                <form
                  onSubmit={mode === "login" ? handleLogin : handleRegister}
                  className="flex flex-col gap-5"
                >
                  {mode === "register" && (
                    <div className="relative group">
                      <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-400 transition-colors" />
                      <input
                        type="text"
                        required
                        placeholder="Nama Lengkap"
                        className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-100 focus:bg-white text-slate-800 placeholder-slate-400 transition-all rounded-[1.5rem] outline-none text-sm font-medium"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="relative group">
                    <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-400 transition-colors" />
                    <input
                      type="email"
                      required
                      placeholder="Email Aktif"
                      className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-100 focus:bg-white text-slate-800 placeholder-slate-400 transition-all rounded-[1.5rem] outline-none text-sm font-medium"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="relative group">
                    <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-400 transition-colors" />
                    <input
                      type="password"
                      required
                      minLength={mode === "register" ? 8 : undefined}
                      placeholder={mode === "register" ? "Kata Sandi (min. 8 karakter)" : "Kata Sandi"}
                      className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-100 focus:bg-white text-slate-800 placeholder-slate-400 transition-all rounded-[1.5rem] outline-none text-sm font-medium"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {/* Enhanced Error Box */}
                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-rose-50 border border-rose-100 rounded-2xl px-5 py-4"
                      >
                        <p className="text-rose-600 text-[13px] font-bold flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                          {error}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-rose-500 to-rose-400 text-white font-black py-4.5 rounded-[1.5rem] shadow-[0_12px_24px_-8px_rgba(244,63,94,0.4)] hover:shadow-[0_16px_32px_-8px_rgba(244,63,94,0.5)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-2 disabled:grayscale disabled:opacity-70"
                  >
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : null}
                    {loading
                      ? "Memproses…"
                      : mode === "login"
                        ? "Masuk ke Akun"
                        : "Buat Akun Sekarang"}
                  </button>
                </form>

                {/* Toggle Footer */}
                <p className="text-center text-sm text-slate-500 mt-8 font-medium">
                  {mode === "login" ? (
                    <>
                      Belum punya akun?{" "}
                      <button
                        type="button"
                        className="text-rose-500 font-black hover:underline underline-offset-4"
                        onClick={() => { setMode("register"); setError(""); }}
                      >
                        Daftar Gratis
                      </button>
                    </>
                  ) : (
                    <>
                      Sudah punya akun?{" "}
                      <button
                        type="button"
                        className="text-rose-500 font-black hover:underline underline-offset-4"
                        onClick={() => { setMode("login"); setError(""); }}
                      >
                        Masuk Sekarang
                      </button>
                    </>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
