"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

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
      <section className="panel" style={{ padding: "1rem", minHeight: 190, display: "grid", placeItems: "center" }}>
        <strong className="muted">Belum ada banner promo aktif.</strong>
      </section>
    );
  }

  const active = banners[index];

  return (
    <section className="panel" style={{ overflow: "hidden", position: "relative" }}>
      <Image
        src={active.imageUrl}
        alt={active.title}
        width={1200}
        height={240}
        style={{ width: "100%", height: 240, objectFit: "cover", display: "block" }}
      />
      <div style={{ position: "absolute", inset: "auto 0 0 0", padding: "1rem", color: "#fff", background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.72))" }}>
        <h2 style={{ margin: 0 }}>{active.title}</h2>
        {active.targetUrl && (
          <a href={active.targetUrl} style={{ display: "inline-block", marginTop: "0.45rem", fontWeight: 700, color: "#fff7d6" }}>
            Lihat promo
          </a>
        )}
      </div>
      <div style={{ position: "absolute", right: 14, bottom: 14, display: "flex", gap: 6 }}>
        {banners.map((banner, dotIndex) => (
          <button
            key={banner.id || dotIndex}
            type="button"
            onClick={() => setIndex(dotIndex)}
            aria-label={`Pindah ke promo ${dotIndex + 1}`}
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: dotIndex === index ? "#ffd29f" : "rgba(255,255,255,0.6)"
            }}
          />
        ))}
      </div>
    </section>
  );
}
