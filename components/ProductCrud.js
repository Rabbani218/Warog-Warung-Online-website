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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/products", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Gagal load produk.");
        return;
      }
      setProducts(data);
      setError("");
    } catch (error) {
      setError(error?.message || "Gagal memuat produk.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createProduct(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
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
      await load();
      setError("");
    } catch (error) {
      setError(error?.message || "Tidak dapat menambah produk.");
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(id) {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Gagal menghapus produk.");
        return;
      }
      await load();
    } catch (error) {
      setError(error?.message || "Tidak dapat menghapus produk.");
    } finally {
      setSaving(false);
    }
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
        <button className="btn" type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Tambah Produk"}</button>
      </form>
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      {loading ? (
        <p style={{ color: "#475569" }}>Memuat daftar produk...</p>
      ) : (
        <div className="grid" style={{ marginTop: "1rem" }}>
          {products.map((product) => (
            <article key={product.id} className="panel" style={{ padding: "0.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <strong>{product.name}</strong>
                <button className="btn" disabled={saving} onClick={() => removeProduct(product.id)}>Hapus</button>
              </div>
              <p style={{ marginBottom: 0, color: "#6b7280" }}>Rp {Number(product.price).toLocaleString("id-ID")}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
