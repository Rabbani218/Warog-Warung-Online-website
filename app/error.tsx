"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <section className="panel" style={{ maxWidth: 560, textAlign: "center" }}>
        <h1 style={{ margin: 0 }}>Terjadi kesalahan</h1>
        <p style={{ color: "#6b7280" }}>Maaf, ada masalah saat memuat halaman ini.</p>
        <button className="btn" type="button" onClick={() => reset()} style={{ marginTop: "1rem" }}>
          Coba kembali
        </button>
      </section>
    </main>
  );
}
