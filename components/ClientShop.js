"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import PromoCarousel from "@/components/PromoCarousel";
import FloatingCart from "@/components/FloatingCart";
import ClientAuthModal from "@/components/ClientAuthModal";
import ReviewSection from "@/components/ReviewSection";
import FloatingCSButton from "@/components/FloatingCSButton";

import Image from "next/image";

export default function ClientShop({ store, menus, banners, tableNumber, paymentSettings, employees, reviews = [] }) {
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");
  const [addedItem, setAddedItem] = useState(null);
  const { status } = useSession();
  const [showAuth, setShowAuth] = useState(false);

  const filtered = useMemo(() => {
    const keyword = query.toLowerCase().trim();
    if (!keyword) return menus;
    return menus.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [menus, query]);

  function addToCart(menu) {
    if (status === "unauthenticated") {
      setShowAuth(true);
      return;
    }

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

  const mapAddress = String(store.address || "").trim();
  const mapEmbedUrl = mapAddress
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`
    : "";

  return (
    <main className="container" style={{ padding: "1.1rem 0 2rem" }}>
      <header className="panel hero-shell" style={{ padding: "1.2rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <span className="badge">Warteg Digital Experience</span>
          <a className="btn btn-secondary" href="/admin" style={{ whiteSpace: "nowrap" }}>Admin Login</a>
        </div>
        <h1 style={{ margin: "0.6rem 0 0.3rem", fontSize: "clamp(1.7rem, 3vw, 2.5rem)" }}>{store.heroTitle || store.name}</h1>
        <p className="muted" style={{ margin: 0, maxWidth: 650 }}>
          {store.heroSubtitle || store.description || "Belanja menu favoritmu dengan checkout instan."}
        </p>
        {store.operationalHours && (
          <p className="text-sm font-semibold text-emerald-600 mt-2">🕒 Jam Operasional: {store.operationalHours}</p>
        )}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem", flexWrap: "wrap" }}>
          {tableNumber ? <p style={{ margin: 0, color: "#334155" }}>Meja aktif: <strong>{tableNumber}</strong></p> : <p style={{ margin: 0 }} className="muted">Pesan untuk makan di tempat atau takeaway.</p>}
          <span className="badge">{menus.length} Menu Siap Dipesan</span>
        </div>
      </header>

      {mapAddress ? (
        <section className="panel" style={{ padding: "1rem", marginBottom: "1rem" }}>
          <h2 style={{ margin: "0 0 0.45rem" }}>Lokasi Warung</h2>
          <p className="muted" style={{ marginTop: 0 }}>{mapAddress}</p>
          <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0" }}>
            <iframe
              title="Lokasi Warung"
              src={mapEmbedUrl}
              style={{ width: "100%", height: 280, border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a className="btn btn-ghost" style={{ marginTop: "0.75rem", display: "inline-flex" }} href={`https://maps.google.com/?q=${encodeURIComponent(mapAddress)}`} target="_blank" rel="noreferrer">
            Buka di Google Maps
          </a>
        </section>
      ) : null}

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
                <Image src={menu.imageUrl || "https://placehold.co/600x400/f8fafc/334155.png?text=Wareb+Menu"} alt={menu.name} className="menu-image" width={600} height={400} />
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
                  <ReviewSection menu={menu} reviews={reviews} onRequireAuth={() => setShowAuth(true)} />
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <FloatingCart cart={cart} setCart={setCart} paymentSettings={paymentSettings} />
      </section>

      {Array.isArray(employees) && employees.length ? (
        <section className="panel" style={{ marginTop: "1rem", padding: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>Tim Kami</h3>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
            {employees.map((employee) => (
              <article key={employee.id} className="glass-card" style={{ padding: "0.75rem" }}>
                <strong>{employee.name}</strong>
                <p className="muted" style={{ margin: "0.3rem 0" }}>{employee.role || "Crew"}</p>
                {employee.phone ? <p style={{ margin: 0 }}>{employee.phone}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <FloatingCSButton whatsappNumber={store.whatsappNumber} onRequireAuth={() => setShowAuth(true)} />
      <ClientAuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </main>
  );
}
