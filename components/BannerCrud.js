"use client";

import { useEffect, useState } from "react";

const defaultBanner = {
  title: "",
  imageUrl: "",
  targetUrl: "",
  sortOrder: 0,
  isActive: true
};

export default function BannerCrud() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(defaultBanner);

  async function load() {
    const response = await fetch("/api/admin/banners", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) setBanners(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function createBanner(event) {
    event.preventDefault();
    const response = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    if (response.ok) {
      setBanners((prev) => [...prev, data]);
      setForm(defaultBanner);
    }
  }

  async function deleteBanner(id) {
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    setBanners((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <section className="panel" style={{ padding: "1rem" }}>
      <h3 style={{ marginTop: 0 }}>Banner Iklan</h3>
      <form className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))" }} onSubmit={createBanner}>
        <input className="input" placeholder="Judul banner" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
        <input className="input" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))} required />
        <input className="input" placeholder="Target URL" value={form.targetUrl} onChange={(e) => setForm((prev) => ({ ...prev, targetUrl: e.target.value }))} />
        <input className="input" type="number" placeholder="Sort order" value={form.sortOrder} onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))} />
        <button className="btn" type="submit">Tambah Banner</button>
      </form>
      <div className="grid" style={{ marginTop: "1rem" }}>
        {banners.map((banner) => (
          <article key={banner.id} className="panel" style={{ padding: "0.8rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{banner.title}</strong>
              <button className="btn" onClick={() => deleteBanner(banner.id)}>Hapus</button>
            </div>
            <p style={{ marginBottom: 0, color: "#6b7280" }}>{banner.imageUrl}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
