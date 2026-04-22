"use client";

import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { X, Mail, Lock, Loader2, User, UserPlus } from "lucide-react";
import { toast } from "sonner";

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
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role: "CLIENT",
        }),
      });

      if (!registerRes.ok) {
        const data = await registerRes.json().catch(() => ({}));
        throw new Error(data?.message || "Registrasi gagal.");
      }

      toast.success("Akun berhasil dibuat! Sedang login…");

      // 2. Auto-login after registration
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      toast.success("Login berhasil!");
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
        email: email.trim().toLowerCase(),
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

      toast.success("Login berhasil!");
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
      await signIn("google", {
        callbackUrl: window.location.href,
      });
    } catch (err) {
      console.error("[ClientAuth] Google login error:", err);
      toast.error("Login Google gagal. Coba lagi nanti.");
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onClose()}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="glass-card overflow-hidden rounded-[2.5rem] relative bg-white/95 shadow-2xl border-white/40 w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto pointer-events-auto custom-scrollbar">
              <button
                onClick={() => onClose()}
                className="absolute right-6 top-6 text-gray-400 hover:text-slate-900 transition-colors z-10 p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="p-6 md:p-10">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    {mode === "login" ? (
                      <Lock className="text-[#FF6B6B]" size={32} />
                    ) : (
                      <UserPlus className="text-[#FF6B6B]" size={32} />
                    )}
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-2">
                    {mode === "login" ? "Masuk ke Akun" : "Buat Akun Baru"}
                  </h2>
                  <p className="text-slate-500 text-sm px-4">
                    {mode === "login"
                      ? "Gunakan akun Anda untuk melanjutkan pesanan atau memberikan ulasan."
                      : "Daftar untuk bisa memesan dan memberikan ulasan."}
                  </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-2xl mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError("");
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                      mode === "login"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setError("");
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                      mode === "register"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Daftar
                  </button>
                </div>

                {/* Google OAuth */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full bg-white text-slate-700 border border-slate-200 hover:border-rose-200 hover:bg-rose-50/30 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {loading ? "Memproses…" : mode === "login" ? "Masuk dengan Google" : "Daftar dengan Google"}
                </button>

                <div className="relative flex items-center justify-center my-6">
                  <div className="border-t border-slate-100 w-full"></div>
                  <span className="bg-[#fffdfd] px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 absolute">
                    atau
                  </span>
                </div>

                {/* Form */}
                <form
                  onSubmit={mode === "login" ? handleLogin : handleRegister}
                  className="flex flex-col gap-4"
                >
                  {/* Name (Register only) */}
                  {mode === "register" && (
                    <div className="relative group">
                      <User
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6B6B] transition-colors"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Nama lengkap"
                        className="input pl-12 bg-slate-50/50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white transition-all rounded-2xl"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Email */}
                  <div className="relative group">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6B6B] transition-colors"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email anda"
                      className="input pl-12 bg-slate-50/50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white transition-all rounded-2xl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Password */}
                  <div className="relative group">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6B6B] transition-colors"
                    />
                    <input
                      type="password"
                      required
                      minLength={mode === "register" ? 8 : undefined}
                      placeholder={mode === "register" ? "Password (min. 8 karakter)" : "Password"}
                      className="input pl-12 bg-slate-50/50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white transition-all rounded-2xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                      <p className="text-red-600 text-sm font-medium">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn w-full flex items-center justify-center gap-2 mt-2 py-4 rounded-2xl"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : null}
                    {loading
                      ? "Memproses…"
                      : mode === "login"
                        ? "Masuk ke Akun"
                        : "Daftar & Masuk"}
                  </button>
                </form>

                {/* Switch Mode Link */}
                <p className="text-center text-sm text-slate-500 mt-5">
                  {mode === "login" ? (
                    <>
                      Belum punya akun?{" "}
                      <button
                        type="button"
                        className="text-[#FF6B6B] font-bold hover:underline"
                        onClick={() => {
                          setMode("register");
                          setError("");
                        }}
                      >
                        Daftar di sini
                      </button>
                    </>
                  ) : (
                    <>
                      Sudah punya akun?{" "}
                      <button
                        type="button"
                        className="text-[#FF6B6B] font-bold hover:underline"
                        onClick={() => {
                          setMode("login");
                          setError("");
                        }}
                      >
                        Masuk
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
