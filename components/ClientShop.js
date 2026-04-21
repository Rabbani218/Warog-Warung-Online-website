"use client";

import { useMemo, useState } from "react";
import PromoCarousel from "@/components/PromoCarousel";
import FloatingCart from "@/components/FloatingCart";

export default function ClientShop({ store, menus, banners }) {
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const keyword = query.toLowerCase().trim();
    if (!keyword) return menus;
    return menus.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [menus, query]);

  function addToCart(menu) {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuId === menu.id);
      if (existing) {
        return prev.map((item) =>
          item.menuId === menu.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...prev, { menuId: menu.id, name: menu.name, price: Number(menu.price), quantity: 1, note: "" }];
    });
  }

  return (
    <main className="container" style={{ padding: "1.1rem 0 2rem" }}>
      <header className="panel" style={{ padding: "1.2rem", marginBottom: "1rem" }}>
        <span className="badge">Shopee-style Warteg Modern</span>
        <h1 style={{ margin: "0.6rem 0 0.3rem", fontFamily: '"Segoe Print", cursive' }}>{store.heroTitle || store.name}</h1>
        <p style={{ margin: 0, color: "#6b7280" }}>{store.heroSubtitle || store.description || "Belanja menu favoritmu dengan checkout instan."}</p>
      </header>

      <PromoCarousel banners={banners} />

      <section style={{ display: "grid", gridTemplateColumns: "2fr minmax(290px, 1fr)", gap: "1rem", marginTop: "1rem" }}>
        <div>
          <div className="panel" style={{ padding: "1rem", marginBottom: "1rem" }}>
            <input
              className="input"
              placeholder="Cari menu favorit..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
            {filtered.map((menu) => (
              <article key={menu.id} className="panel" style={{ overflow: "hidden" }}>
                <img src={menu.imageUrl || "https://placehold.co/600x400/f8fafc/334155?text=Wareb+Menu"} alt={menu.name} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                <div style={{ padding: "0.9rem" }}>
                  <h3 style={{ margin: 0 }}>{menu.name}</h3>
                  <p style={{ color: "#6b7280", minHeight: 40 }}>{menu.description || "Menu warteg modern pilihan."}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>Rp {Number(menu.price).toLocaleString("id-ID")}</strong>
                    <button className="btn" onClick={() => addToCart(menu)}>Tambah</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <FloatingCart cart={cart} setCart={setCart} />
      </section>
    </main>
  );
}
