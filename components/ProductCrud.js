"use client";

import { useEffect, useState } from "react";

const initialForm = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  price: "",
  isActive: true
};

export default function ProductCrud() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  async function load() {
    const response = await fetch("/api/admin/products", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "Gagal load produk.");
      return;
    }
    setProducts(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function createProduct(event) {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: Number(form.price || 0), recipes: [] })
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Gagal menambah produk.");
      return;
    }

    setForm(initialForm);
    setProducts((prev) => [data, ...prev]);
  }

  async function removeProduct(id) {
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <section className="panel" style={{ padding: "1rem" }}>
      <h3 style={{ marginTop: 0 }}>Product Management</h3>
      <form className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }} onSubmit={createProduct}>
        <input className="input" placeholder="Nama menu" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
        <input className="input" placeholder="Slug" value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} required />
        <input className="input" placeholder="Harga" type="number" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} required />
        <input className="input" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))} />
        <textarea className="input" placeholder="Deskripsi" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
        <button className="btn" type="submit">Tambah Produk</button>
      </form>
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      <div className="grid" style={{ marginTop: "1rem" }}>
        {products.map((product) => (
          <article key={product.id} className="panel" style={{ padding: "0.8rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{product.name}</strong>
              <button className="btn" onClick={() => removeProduct(product.id)}>Hapus</button>
            </div>
            <p style={{ marginBottom: 0, color: "#6b7280" }}>Rp {Number(product.price).toLocaleString("id-ID")}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
