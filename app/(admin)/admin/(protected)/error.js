"use client";

import { useEffect } from "react";

export default function AdminPageError({ error, reset }) {
  useEffect(() => {
    console.error("[Admin Page Error]", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "2rem",
        textAlign: "center"
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          padding: "2rem",
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(16px)",
          borderRadius: "1.25rem",
          border: "1px solid rgba(239,68,68,0.12)",
          boxShadow: "0 20px 50px -12px rgba(0,0,0,0.06)"
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔧</div>
        <h2
          style={{
            margin: "0 0 0.5rem",
            color: "#1e293b",
            fontSize: "1.25rem",
            fontWeight: 800
          }}
        >
          Halaman Mengalami Gangguan
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.25rem", lineHeight: 1.5 }}>
          {error?.message || "Terjadi kesalahan saat memuat halaman ini."}
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "0.65rem 1.5rem",
              background: "linear-gradient(135deg, #FF6B6B, #ee5a5a)",
              color: "white",
              border: "none",
              borderRadius: "0.65rem",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: "pointer",
              boxShadow: "0 4px 12px -2px rgba(255,107,107,0.4)"
            }}
          >
            Muat Ulang
          </button>
          <button
            type="button"
            onClick={() => window.location.href = "/admin/dashboard"}
            style={{
              padding: "0.65rem 1.5rem",
              background: "white",
              color: "#374151",
              border: "1px solid #e5e7eb",
              borderRadius: "0.65rem",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer"
            }}
          >
            Ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
