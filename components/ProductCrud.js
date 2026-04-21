"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search, Plus, Trash2 } from "lucide-react";

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
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/products", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) return setError(data.message || "Gagal load produk.");
      setProducts(data);
      setError("");
    } catch (error) {
      setError(error?.message || "Gagal memuat produk.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

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
      if (!response.ok) return setError(data.message || "Gagal menambah produk.");
      setForm(initialForm);
      await load();
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
      if (response.ok) await load();
      else setError("Gagal menghapus produk.");
    } catch (error) {
      setError("Tidak dapat menghapus produk.");
    } finally {
      setSaving(false);
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  return (
    <section className="glass-panel p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="retro-title text-xl text-white">Product Catalog</h3>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="glass-input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 bg-black/20 p-4 rounded-xl border border-white/5" onSubmit={createProduct}>
        <input className="glass-input lg:col-span-1" placeholder="Nama Menu" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="glass-input lg:col-span-1" placeholder="Slug (unique)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        <input className="glass-input lg:col-span-1" placeholder="Harga" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <input className="glass-input lg:col-span-1" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        <input className="glass-input lg:col-span-1" placeholder="Deskripsi Singkat" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="glass-btn-primary flex items-center justify-center gap-2 lg:col-span-1" type="submit" disabled={saving}>
          <Plus size={18} /> {saving ? "..." : "Tambah"}
        </button>
      </form>
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-400 animate-pulse">Memuat daftar produk...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.article 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={product.id} 
                className="glass-panel overflow-hidden flex flex-col"
              >
                <div className="h-40 w-full bg-black/40 relative">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover opacity-80 hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                  )}
                  <button 
                    className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-all shadow-lg"
                    onClick={() => removeProduct(product.id)}
                    disabled={saving}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">{product.name}</h4>
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">{product.description || "Tanpa deskripsi"}</p>
                  </div>
                  <p className="text-determination-orange font-bold text-lg">Rp {Number(product.price).toLocaleString("id-ID")}</p>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
          {filteredProducts.length === 0 && <p className="text-gray-400 col-span-full text-center py-8">Tidak ada produk ditemukan.</p>}
        </div>
      )}
    </section>
  );
}
