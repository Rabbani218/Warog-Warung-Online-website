"use client";

import { useEffect, useMemo, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "owner@wareb.local", password: "wareb12345" });
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const queryEmail = useMemo(() => String(searchParams?.get("email") || "").trim(), [searchParams]);
  const queryMessage = useMemo(() => String(searchParams?.get("message") || "").trim(), [searchParams]);
  const queryError = useMemo(() => String(searchParams?.get("error") || "").trim(), [searchParams]);

  useEffect(() => {
    if (queryEmail) {
      setForm((prev) => ({ ...prev, email: queryEmail }));
    }
  }, [queryEmail]);

  useEffect(() => {
    if (queryMessage) {
      toast.info(queryMessage);
    }
  }, [queryMessage]);

  useEffect(() => {
    if (!queryError) {
      return;
    }

    if (queryError === "google") {
      toast.error("Login Google gagal. Periksa Authorized redirect URI pada Google Console.");
      return;
    }

    if (queryError === "OAuthSignin" || queryError === "OAuthCallback") {
      toast.error("OAuth callback gagal. Pastikan domain callback login Google sudah benar.");
      return;
    }

    toast.error(`Autentikasi gagal: ${queryError}`);
  }, [queryError]);

  useEffect(() => {
    let mounted = true;

    async function loadProviders() {
      const providers = await getProviders();
      if (!mounted) {
        return;
      }
      setGoogleEnabled(Boolean(providers?.google));
    }

    loadProviders().catch(() => {
      if (mounted) {
        setGoogleEnabled(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      if (mode === "register") {
        const registerRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: "ADMIN" })
        });

        if (!registerRes.ok) {
          const err = await registerRes.json();
          throw new Error(err?.message || "Registrasi gagal.");
        }

        toast.success("Registrasi berhasil. Sedang login...");
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false
      });

      if (!result || result.error) {
        throw new Error("Login gagal. Cek kredensial Anda.");
      }

      toast.success("Login berhasil! Mengalihkan...");
      router.push("/admin/dashboard");
    } catch (error) {
      toast.error(error?.message || "Terjadi kesalahan saat autentikasi.");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    if (!googleEnabled) {
      toast.warning("Login Google belum aktif. Silakan gunakan email dan password.");
      return;
    }

    setLoading(true);

    try {
      const browserOrigin = window.location.origin;
      const configuredOrigin = String(process.env.NEXT_PUBLIC_AUTH_ORIGIN || "").trim();
      const authOrigin = configuredOrigin || browserOrigin;
      const callbackUrl = `${authOrigin}/admin/dashboard`;

      if (authOrigin !== browserOrigin) {
        window.location.assign(`${authOrigin}/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        return;
      }

      await signIn("google", { callbackUrl });
    } catch (error) {
      toast.error("Login Google gagal. Coba lagi nanti.");
      setLoading(false);
    }
  }

  if (!isMounted) return null;

  return (
    <main className="w-full max-w-7xl mx-auto" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "1rem 0" }}>
      <section className="panel hero-shell" style={{ width: "min(620px,100%)", padding: "1.35rem" }}>
        <span className="badge">Admin Workspace</span>
        <h1 style={{ margin: "0.55rem 0 0", fontSize: "clamp(1.5rem, 3vw, 2.15rem)" }}>Kelola Operasional Warung</h1>
        <p className="muted" style={{ marginTop: "0.45rem" }}>Masuk ke dashboard admin untuk atur menu, pantau order, dan kontrol KDS.</p>

        <div className="panel" style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap", padding: "0.5rem", background: "#fff8ec" }}>
          <button className={mode === "login" ? "btn" : "btn btn-ghost"} type="button" onClick={() => setMode("login")}>Login</button>
          <button className={mode === "register" ? "btn" : "btn btn-ghost"} type="button" onClick={() => setMode("register")}>Register</button>
            <button 
              className="btn" 
              type="button" 
              onClick={signInWithGoogle} 
              disabled={loading || !googleEnabled}
              style={{
                background: "white",
                color: "#1f2937",
                boxShadow: "0 4px 16px rgba(31, 41, 55, 0.12)",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                fontSize: "0.95rem",
                fontWeight: 600
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M7 12a5 5 0 0 1 10 0"/>
              </svg>
              {loading ? "Memuat..." : "Login dengan Google"}
            </button>
        </div>

        <form className="grid" onSubmit={onSubmit}>
          {mode === "register" && (
            <input
              className="input"
              placeholder="Nama"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          )}
            <input 
              className="input" 
              type="email" 
              placeholder="📧 Email" 
              value={form.email} 
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} 
              required 
            />
            <input 
              className="input" 
              type="password" 
              placeholder="🔐 Password" 
              value={form.password} 
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} 
              required 
            />
          <button className="btn" type="submit" disabled={loading}>{loading ? "Memproses..." : (mode === "login" ? "Masuk ke Dashboard" : "Daftar & Masuk")}</button>
        </form>

        <p className="muted" style={{ marginTop: "1rem", marginBottom: 0, fontSize: "0.88rem" }}>
          Jika login Google gagal, daftarkan callback berikut di Google Console:
          <br />
          https://wareb-next-platform.vercel.app/api/auth/callback/google
        </p>
      </section>
    </main>
  );
}
