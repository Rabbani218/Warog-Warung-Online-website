"use client";

import { useEffect, useMemo, useState } from "react";
import { getProviders, signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // ── Auto-redirect if already logged in ──────────────────────────────
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      window.location.href = "/admin/dashboard";
    }
  }, [status, session]);



  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ── Extract URL query params (errors, messages) ─────────────────────
  const queryEmail = useMemo(
    () => String(searchParams?.get("email") || "").trim(),
    [searchParams]
  );
  const queryMessage = useMemo(
    () => String(searchParams?.get("message") || "").trim(),
    [searchParams]
  );
  const queryError = useMemo(
    () => String(searchParams?.get("error") || "").trim(),
    [searchParams]
  );

  useEffect(() => {
    if (queryEmail) {
      setForm((prev) => ({ ...prev, email: queryEmail }));
    }
  }, [queryEmail]);

  useEffect(() => {
    if (queryMessage) toast.info(queryMessage);
  }, [queryMessage]);

  // ── Handle OAuth / NextAuth error codes from URL ────────────────────
  useEffect(() => {
    if (!queryError) return;

    const errorMessages = {
      SessionExpired: "Sesi Anda telah berakhir. Silakan login kembali.",
      Unauthorized: "Anda tidak memiliki akses admin.",
      OAuthSignin: "Gagal memulai login Google. Periksa konfigurasi OAuth.",
      OAuthCallback: "Callback OAuth gagal. Pastikan redirect URI sudah benar di Google Console.",
      OAuthCreateAccount: "Gagal membuat akun dari Google. Coba lagi.",
      OAuthAccountNotLinked: "Email ini sudah terdaftar dengan metode login lain. Gunakan email/password.",
      Callback: "Terjadi kesalahan saat proses callback autentikasi.",
      AccessDenied: "Akses ditolak. Anda tidak memiliki izin.",
      CredentialsSignin: "Email atau password salah.",
      google: "Login Google gagal. Periksa Authorized redirect URI pada Google Console.",
    };

    const message = errorMessages[queryError] || `Autentikasi gagal: ${queryError}`;
    toast.error(message);
  }, [queryError]);

  // ── Load available providers ────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    getProviders()
      .then((providers) => {
        if (mounted) setGoogleEnabled(Boolean(providers?.google));
      })
      .catch(() => {
        if (mounted) setGoogleEnabled(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // ── Credentials Login / Register ────────────────────────────────────
  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      // Registration flow
      if (mode === "register") {
        const registerRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role: "ADMIN",
          }),
        });

        if (!registerRes.ok) {
          const err = await registerRes.json().catch(() => ({}));
          throw new Error(err?.message || "Registrasi gagal.");
        }

        toast.success("Registrasi berhasil! Sedang login…");
      }

      // Sign in (both login and post-registration)
      const result = await signIn("credentials", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });

      if (!result) {
        throw new Error("Tidak ada respons dari server autentikasi.");
      }

      if (result.error) {
        // NextAuth passes the `throw new Error(msg)` from authorize() here
        throw new Error(result.error);
      }

      toast.success("Login berhasil! Mengalihkan ke dashboard…");
      window.location.href = "/admin/dashboard";

    } catch (error) {
      toast.error(error?.message || "Terjadi kesalahan saat autentikasi.");
    } finally {
      setLoading(false);
    }
  }

  // ── Google OAuth Login ──────────────────────────────────────────────
  async function signInWithGoogle() {
    if (!googleEnabled) {
      toast.warning(
        "Login Google belum aktif. Pastikan GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET sudah dikonfigurasi."
      );
      return;
    }

    setLoading(true);

    try {
      await signIn("google", { callbackUrl: "/admin/dashboard" });
    } catch (error) {
      console.error("[AdminLogin] Google sign in error:", error);
      toast.error("Login Google gagal. Coba lagi nanti.");
      setLoading(false);
    }
  }

  if (!isMounted) return null;

  return (
    <main
      className="w-full max-w-7xl mx-auto"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "1rem 0",
      }}
    >
      <section
        className="panel hero-shell"
        style={{ width: "min(620px,100%)", padding: "1.35rem" }}
      >
        <span className="badge">Admin Workspace</span>
        <h1
          style={{
            margin: "0.55rem 0 0",
            fontSize: "clamp(1.5rem, 3vw, 2.15rem)",
          }}
        >
          Kelola Operasional Warung
        </h1>
        <p className="muted" style={{ marginTop: "0.45rem" }}>
          Masuk ke dashboard admin untuk atur menu, pantau order, dan kontrol
          KDS.
        </p>

        <div
          className="panel"
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
            padding: "0.5rem",
            background: "#fff8ec",
          }}
        >
          <button
            className={mode === "login" ? "btn" : "btn btn-ghost"}
            type="button"
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={mode === "register" ? "btn" : "btn btn-ghost"}
            type="button"
            onClick={() => setMode("register")}
          >
            Register
          </button>
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
              fontWeight: 600,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {loading ? "Memuat…" : "Login dengan Google"}
          </button>
        </div>

        <form className="grid" onSubmit={onSubmit}>
          {mode === "register" && (
            <input
              className="input"
              placeholder="Nama"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          )}
          <input
            className="input"
            type="email"
            placeholder="📧 Email"
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
            required
          />
          <input
            className="input"
            type="password"
            placeholder="🔐 Password"
            value={form.password}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, password: e.target.value }))
            }
            required
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading
              ? "Memproses…"
              : mode === "login"
                ? "Masuk ke Dashboard"
                : "Daftar & Masuk"}
          </button>
        </form>

        <p
          className="muted"
          style={{ marginTop: "1rem", marginBottom: 0, fontSize: "0.88rem" }}
        >
          Jika login Google gagal, daftarkan callback berikut di Google Console:
          <br />
          <code className="bg-slate-100 px-1 rounded text-[#FF6B6B]">
            {isMounted
              ? `${window.location.origin}/api/auth/callback/google`
              : "https://domain-anda.com/api/auth/callback/google"}
          </code>
        </p>
      </section>
    </main>
  );
}
