"use client";

import { useEffect } from "react";

export default function SetupError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <section className="panel" style={{ maxWidth: 560, textAlign: "center" }}>
        <h1 style={{ margin: 0 }}>Gagal memuat Setup</h1>
        <p style={{ color: "#6b7280" }}>Silakan muat ulang halaman atau periksa koneksi database.</p>
        <button className="btn" type="button" onClick={() => reset()} style={{ marginTop: "1rem" }}>
          Muat ulang
        </button>
      </section>
    </main>
  );
}
