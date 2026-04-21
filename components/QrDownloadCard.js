"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QrDownloadCard() {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!origin) {
    return (
      <section className="panel" style={{ padding: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>QR Code Generator</h3>
        <p>Menyiapkan URL QR...</p>
      </section>
    );
  }

  const tableUrl = `${origin}/?table=4`;
  const storeUrl = `${origin}/`;

  function downloadQr(canvasId, filename) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <section className="panel" style={{ padding: "1rem" }}>
      <h3 style={{ marginTop: 0 }}>QR Code Generator</h3>
      <p style={{ color: "#6b7280" }}>Download QR URL meja atau URL toko untuk print area kasir/meja.</p>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
        <div>
          <QRCodeCanvas id="table-qr" value={tableUrl} size={150} includeMargin />
          <p style={{ margin: "0.5rem 0" }}>Meja 4</p>
          <button className="btn" onClick={() => downloadQr("table-qr", "wareb-table-4.png")}>Download QR Meja</button>
        </div>
        <div>
          <QRCodeCanvas id="store-qr" value={storeUrl} size={150} includeMargin />
          <p style={{ margin: "0.5rem 0" }}>URL Toko Umum</p>
          <button className="btn" onClick={() => downloadQr("store-qr", "wareb-store.png")}>Download QR Toko</button>
        </div>
      </div>
    </section>
  );
}
