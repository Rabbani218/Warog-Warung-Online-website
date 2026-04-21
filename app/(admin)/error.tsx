"use client";

import { useEffect } from "react";

export default function AdminError({ error, reset }) {
  useEffect(() => {
    console.error("Admin area error:", error);
  }, [error]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem", backgroundColor: "#fef2f2" }}>
      <section className="panel" style={{ maxWidth: 640, width: "100%", padding: "2rem", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
        <h1 style={{ margin: "0 0 1rem", color: "#991b1b", fontSize: "1.5rem" }}>Terdapat Kesalahan Sistem</h1>
        
        <p style={{ color: "#4b5563", marginBottom: "1rem" }}>
          Maaf, terjadi kesalahan tak terduga saat memuat halaman ini.
        </p>

        <div style={{ backgroundColor: "#f3f4f6", padding: "1rem", borderRadius: "8px", overflowX: "auto", marginBottom: "1.5rem" }}>
          <code style={{ fontSize: "0.875rem", color: "#ef4444", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {error?.message || "Unknown error"}
          </code>
          {error?.stack && (
            <pre style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.5rem", whiteSpace: "pre-wrap", overflowX: "auto" }}>
              {error.stack}
            </pre>
          )}
        </div>

        <button 
          className="btn" 
          type="button" 
          onClick={() => reset()} 
          style={{ width: "100%", backgroundColor: "#ef4444" }}
        >
          Coba Muat Ulang Halaman
        </button>
      </section>
    </main>
  );
}
