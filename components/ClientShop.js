"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import PromoCarousel from "@/components/PromoCarousel";
import FloatingCart from "@/components/FloatingCart";

export default function ClientShop({ store, menus, banners, tableNumber }) {
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");
  const [addedItem, setAddedItem] = useState(null);

  const filtered = useMemo(() => {
    const keyword = query.toLowerCase().trim();
    if (!keyword) return menus;
    return menus.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [menus, query]);

  function addToCart(menu) {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuId === menu.id);
      if (existing) {
        setAddedItem(menu.id);
        setTimeout(() => setAddedItem(null), 600);

        return prev.map((item) =>
          item.menuId === menu.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      setAddedItem(menu.id);
      setTimeout(() => setAddedItem(null), 600);

      return [...prev, { menuId: menu.id, name: menu.name, price: Number(menu.price), quantity: 1, note: "" }];
    });
  }

  return (
    <main className="container" style={{ padding: "1.1rem 0 2rem" }}>
      <header className="panel hero-shell" style={{ padding: "1.2rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <span className="badge">Warteg Digital Experience</span>
          <a className="btn btn-secondary" href="/admin" style={{ whiteSpace: "nowrap" }}>Admin Login</a>
        </div>
        <h1 style={{ margin: "0.6rem 0 0.3rem", fontSize: "clamp(1.7rem, 3vw, 2.5rem)" }}>{store.heroTitle || store.name}</h1>
        <p className="muted" style={{ margin: 0, maxWidth: 650 }}>{store.heroSubtitle || store.description || "Belanja menu favoritmu dengan checkout instan."}</p>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem", flexWrap: "wrap" }}>
          {tableNumber ? <p style={{ margin: 0, color: "#334155" }}>Meja aktif: <strong>{tableNumber}</strong></p> : <p style={{ margin: 0 }} className="muted">Pesan untuk makan di tempat atau takeaway.</p>}
          <span className="badge">{menus.length} Menu Siap Dipesan</span>
        </div>
      </header>

      <PromoCarousel banners={banners} />

      <section className="shop-layout">
        <div>
          <div className="panel" style={{ padding: "1rem", marginBottom: "1rem" }}>
            <input
              className="input"
              placeholder="Cari menu favorit..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="menu-grid">
            {filtered.map((menu) => (
              <motion.article
                key={menu.id}
                className="panel menu-card"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
              >
                <img src={menu.imageUrl || "https://placehold.co/600x400/f8fafc/334155?text=Wareb+Menu"} alt={menu.name} className="menu-image" />
                <div style={{ padding: "0.9rem" }}>
                  <h3 style={{ margin: 0 }}>{menu.name}</h3>
                  <p className="muted" style={{ minHeight: 40 }}>{menu.description || "Menu warteg modern pilihan."}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                    <strong>Rp {Number(menu.price).toLocaleString("id-ID")}</strong>
                    <motion.button
                      className="btn"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => addToCart(menu)}
                      style={{ minWidth: 100 }}
                    >
                      {addedItem === menu.id ? "Ditambahkan" : "Tambah"}
                    </motion.button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <FloatingCart cart={cart} setCart={setCart} />
      </section>
    </main>
  );
}
