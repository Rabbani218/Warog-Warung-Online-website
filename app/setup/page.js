"use client";

import { Suspense, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSetup } from "./actions";

function LoadingSpinner() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh', width: '100%' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #f3f3f3', borderTop: '4px solid #f97316', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function SetupClient() {
  const { data: session, status, update } = useSession() || { data: null, status: 'loading' };
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMessage = searchParams?.get("error") || "";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin");
    } else if (status === "authenticated" && session?.user?.storeId) {
      router.push("/admin/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading" || status === "unauthenticated") {
    return <LoadingSpinner />;
  }

  return (
      <section className="panel hero-shell" style={{ maxWidth: 680, margin: "0 auto", padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <p className="badge">Wareb V2 Onboarding</p>
            <h1 style={{ margin: "0.75rem 0 0", fontSize: "clamp(1.5rem, 3vw, 2.25rem)", color: "#FF6B6B" }}>Buat Toko Anda</h1>
            <p className="muted" style={{ margin: "0.4rem 0 0" }}>Satu kali setup, langsung siap jualan online dan kelola POS.</p>
          </div>
        </div>

        {errorMessage && (
          <p style={{ margin: "0 0 1rem", color: "#b91c1c", backgroundColor: "#fee2e2", padding: "0.75rem", borderRadius: "8px" }}>
            {errorMessage}
          </p>
        )}

        <form action={async (formData) => {
            await createSetup(formData);
            await update();
        }} className="grid" style={{ gap: "1.5rem" }}>
          <label className="field">
            <span>Nama Toko</span>
            <input 
              name="storeName" 
              className="input" 
              placeholder="🏪 Warteg Bahari" 
              required 
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(255, 107, 107, 0.2)",
                borderRadius: "12px"
              }}
            />
            <small className="muted" style={{ marginTop: "0.25rem", display: "block" }}>Nama ini akan muncul di nota dan etalase digital Anda.</small>
          </label>

          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            <button type="submit" className="btn" style={{ minWidth: 190 }}>Mulai Setup Sekarang</button>
          </div>
        </form>
      </section>
  );
}

export default function SetupPage() {
  return (
    <main className="w-full max-w-7xl mx-auto" style={{ padding: "2rem 0", minHeight: "100vh", display: "grid", alignItems: "center" }}>
      <Suspense fallback={<LoadingSpinner />}>
        <SetupClient />
      </Suspense>
    </main>
  );
}
