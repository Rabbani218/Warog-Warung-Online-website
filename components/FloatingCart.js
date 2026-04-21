"use client";

import { useEffect, useMemo, useState } from "react";
import { enqueueCheckout, flushCheckoutQueue, getQueueItems } from "@/lib/offline-queue";

export default function FloatingCart({ cart, setCart }) {
  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState("");
  const [offlineCount, setOfflineCount] = useState(0);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  function updateQty(menuId, nextQty) {
    if (nextQty <= 0) {
      setCart((prev) => prev.filter((item) => item.menuId !== menuId));
      return;
    }

    setCart((prev) => prev.map((item) => (item.menuId === menuId ? { ...item, quantity: nextQty } : item)));
  }

  async function refreshOfflineCount() {
    try {
      const remaining = await getQueueItems();
      setOfflineCount(remaining.length);
    } catch (_error) {
      setOfflineCount(0);
    }
  }

  useEffect(() => {
    refreshOfflineCount();

    const onOnline = async () => {
      await flushCheckoutQueue();
      await refreshOfflineCount();
    };

    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  async function checkout() {
    setError("");

    if (!cart.length) {
      setError("Keranjang masih kosong.");
      return;
    }

    const payload = {
      tableNumber,
      paymentMethod,
      items: cart.map((item) => ({ menuId: item.menuId, quantity: item.quantity, note: item.note }))
    };

    if (!navigator.onLine) {
      await enqueueCheckout(payload);
      setCart([]);
      setError("Offline mode: pesanan disimpan ke antrean lokal dan akan disinkronkan otomatis.");
      await refreshOfflineCount();
      return;
    }

    try {
      const response = await fetch("/api/client/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Checkout gagal.");
        return;
      }

      setInvoice(data);
      setCart([]);
    } catch (_error) {
      await enqueueCheckout(payload);
      setCart([]);
      setError("Koneksi putus: pesanan dimasukkan ke antrean offline.");

      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration.sync) {
          registration.sync.register("wareb-sync-checkout").catch(() => {});
        }
      }

      await refreshOfflineCount();
    }
  }

  return (
    <aside
      className="panel"
      style={{
        position: "sticky",
        bottom: 14,
        padding: "1rem",
        height: "fit-content"
      }}
    >
      <h3 style={{ marginTop: 0 }}>Floating Cart</h3>
      {cart.length === 0 && <p>Keranjang masih kosong.</p>}
      {cart.map((item) => (
        <div key={item.menuId} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <div>
            <strong>{item.name}</strong>
            <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>Rp {Number(item.price).toLocaleString("id-ID")}</div>
          </div>
          <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
            <button className="btn" onClick={() => updateQty(item.menuId, item.quantity - 1)}>-</button>
            <span>{item.quantity}</span>
            <button className="btn" onClick={() => updateQty(item.menuId, item.quantity + 1)}>+</button>
          </div>
        </div>
      ))}
      <div style={{ borderTop: "1px dashed #fed7aa", paddingTop: "0.75rem", marginTop: "0.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <span>Subtotal</span>
          <strong>Rp {total.toLocaleString("id-ID")}</strong>
        </div>
        <input className="input" placeholder="Nomor meja" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} />
        <select className="select" style={{ marginTop: "0.5rem" }} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="CASH">CASH</option>
          <option value="QRIS">QRIS</option>
          <option value="TRANSFER">TRANSFER</option>
        </select>
        <button className="btn" style={{ marginTop: "0.75rem", width: "100%" }} onClick={checkout}>Checkout & Kirim KOT</button>
      </div>
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      <p style={{ marginTop: "0.3rem", color: "#6b7280" }}>
        Antrean offline: <strong>{offlineCount}</strong>
      </p>
      {invoice && (
        <div style={{ marginTop: "0.8rem", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "0.7rem" }}>
          <strong>Invoice {invoice.invoiceNumber}</strong>
          <p style={{ margin: "0.35rem 0" }}>Order: {invoice.orderCode}</p>
          <p style={{ margin: 0 }}>Grand Total: Rp {Number(invoice.grandTotal).toLocaleString("id-ID")}</p>
        </div>
      )}
    </aside>
  );
}
