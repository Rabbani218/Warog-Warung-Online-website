"use client";

import { useEffect } from "react";

export default function AdminError({ error, reset }) {
  useEffect(() => {
    console.error("[Admin Error Boundary]", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background: "linear-gradient(135deg, #fef2f2 0%, #fff7ed 50%, #fefce8 100%)"
      }}
    >
      <section
        style={{
          maxWidth: 560,
          width: "100%",
          padding: "2.5rem",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          borderRadius: "1.5rem",
          border: "1px solid rgba(239,68,68,0.15)",
          boxShadow: "0 25px 60px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(239,68,68,0.05)"
        }}
      >
        {/* Error Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 1.5rem",
            borderRadius: "1rem",
            background: "linear-gradient(135deg, #fee2e2, #fecaca)",
            display: "grid",
            placeItems: "center",
            fontSize: "1.75rem"
          }}
        >
          ⚠️
        </div>

        <h1
          style={{
            margin: "0 0 0.75rem",
            color: "#991b1b",
            fontSize: "1.5rem",
            fontWeight: 800,
            textAlign: "center",
            letterSpacing: "-0.02em"
          }}
        >
          Terjadi Kesalahan Sistem
        </h1>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "1.25rem",
            textAlign: "center",
            fontSize: "0.95rem",
            lineHeight: 1.6
          }}
        >
          Maaf, terjadi kesalahan tak terduga saat memuat halaman admin.
          Tim kami telah diberitahu.
        </p>

        {/* Error Detail */}
        <div
          style={{
            backgroundColor: "#faf5ff",
            border: "1px solid #e9d5ff",
            padding: "1rem 1.25rem",
            borderRadius: "0.75rem",
            overflowX: "auto",
            marginBottom: "1.5rem"
          }}
        >
          <code
            style={{
              fontSize: "0.825rem",
              color: "#dc2626",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "ui-monospace, 'Cascadia Code', monospace"
            }}
          >
            {error?.message || "Unknown error"}
          </code>
          {error?.digest && (
            <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: "0.5rem" }}>
              Digest: {error.digest}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "0.75rem", flexDirection: "column" }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              width: "100%",
              padding: "0.85rem",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "white",
              border: "none",
              borderRadius: "0.75rem",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
              boxShadow: "0 4px 14px -3px rgba(239,68,68,0.4)",
              transition: "all 0.2s"
            }}
          >
            🔄 Coba Muat Ulang Halaman
          </button>
          <button
            type="button"
            onClick={() => window.location.href = "/admin/dashboard"}
            style={{
              width: "100%",
              padding: "0.85rem",
              background: "white",
              color: "#374151",
              border: "1px solid #e5e7eb",
              borderRadius: "0.75rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            🏠 Kembali ke Dashboard
          </button>
        </div>
      </section>
    </main>
  );
}
