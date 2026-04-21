"use client";

import { useEffect, useMemo, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "owner@wareb.local", password: "wareb12345" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  const queryEmail = useMemo(() => String(searchParams?.get("email") || "").trim(), [searchParams]);
  const queryMessage = useMemo(() => String(searchParams?.get("message") || "").trim(), [searchParams]);

  useEffect(() => {
    if (queryEmail) {
      setForm((prev) => ({ ...prev, email: queryEmail }));
    }
  }, [queryEmail]);

  useEffect(() => {
    if (queryMessage) {
      setMessage(queryMessage);
    }
  }, [queryMessage]);

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
    setMessage("");

    try {
      if (mode === "register") {
        const registerRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: "ADMIN" })
        });

        if (!registerRes.ok) {
          const err = await registerRes.json();
          setMessage(err?.message || "Registrasi gagal.");
          return;
        }

        setMessage("Registrasi berhasil. Sedang login...");
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false
      });

      if (!result || result.error) {
        setMessage("Login gagal. Cek kredensial Anda.");
        return;
      }

      router.push("/admin/dashboard");
    } catch (error) {
      setMessage(error?.message || "Terjadi kesalahan saat autentikasi.");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    if (!googleEnabled) {
      setMessage("Login Google belum aktif. Silakan gunakan email dan password.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await signIn("google", { callbackUrl: "/admin/dashboard" });
    } catch (error) {
      setMessage("Login Google gagal. Coba lagi nanti.");
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <section className="panel" style={{ width: "min(560px,100%)", padding: "1.2rem" }}>
        <h1 style={{ marginTop: 0, fontFamily: '"Segoe Print", cursive' }}>Admin Portal Wareb</h1>
        <p style={{ color: "#6b7280" }}>Login atau registrasi akun pemilik untuk mengelola toko.</p>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <button className="btn" type="button" onClick={() => setMode("login")}>Login</button>
          <button className="btn" type="button" onClick={() => setMode("register")}>Register</button>
          <button className="btn" type="button" onClick={signInWithGoogle} disabled={loading || !googleEnabled} style={{ background: "#4285F4" }}>
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
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
          <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required />
          <button className="btn" type="submit">{mode === "login" ? "Masuk" : "Daftar & Masuk"}</button>
        </form>

        {message && <p style={{ marginTop: "0.75rem", color: "#b91c1c" }}>{message}</p>}
      </section>
    </main>
  );
}
