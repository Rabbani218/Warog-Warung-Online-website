"use client";

import { useEffect, useState } from "react";

export default function PromoCarousel({ banners = [] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!banners.length) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 3500);

    return () => clearInterval(id);
  }, [banners.length]);

  if (!banners.length) {
    return (
      <section className="panel" style={{ padding: "1rem", minHeight: 190 }}>
        <strong>Belum ada banner promo aktif.</strong>
      </section>
    );
  }

  const active = banners[index];

  return (
    <section className="panel" style={{ overflow: "hidden", position: "relative" }}>
      <img
        src={active.imageUrl}
        alt={active.title}
        style={{ width: "100%", height: 240, objectFit: "cover", display: "block" }}
      />
      <div style={{ position: "absolute", inset: "auto 0 0 0", padding: "1rem", color: "#fff", background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.72))" }}>
        <h2 style={{ margin: 0 }}>{active.title}</h2>
      </div>
    </section>
  );
}
