"use client";

import { useEffect, useMemo, useState } from "react";
import { enqueueCheckout, flushCheckoutQueue, getQueueItems } from "@/lib/offline-queue";

export default function FloatingCart({ cart, setCart, paymentSettings }) {
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

  const paymentInfo = {
    QRIS: paymentSettings?.qrisImageUrl || "",
    TRANSFER: paymentSettings?.bankAccount || "",
    EWALLET: paymentSettings?.ewalletNumber || ""
  };

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
      <h3 style={{ marginTop: 0, marginBottom: "0.2rem" }}>Keranjang Aktif</h3>
      <p className="muted" style={{ marginTop: 0, marginBottom: "0.8rem" }}>Tambah menu, pilih metode bayar, lalu checkout.</p>
      {cart.length === 0 && <p className="muted">Keranjang masih kosong.</p>}
      {cart.map((item) => (
        <div key={item.menuId} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <div>
            <strong>{item.name}</strong>
            <div className="muted" style={{ fontSize: "0.85rem" }}>Rp {Number(item.price).toLocaleString("id-ID")}</div>
          </div>
          <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
            <button className="btn btn-ghost" onClick={() => updateQty(item.menuId, item.quantity - 1)} aria-label={`Kurangi ${item.name}`}>-</button>
            <span>{item.quantity}</span>
            <button className="btn btn-ghost" onClick={() => updateQty(item.menuId, item.quantity + 1)} aria-label={`Tambah ${item.name}`}>+</button>
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
          <option value="EWALLET">E-WALLET</option>
        </select>

        {paymentMethod === "TRANSFER" && paymentInfo.TRANSFER ? (
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem" }}>
            Rekening Tujuan: <strong>{paymentInfo.TRANSFER}</strong>
          </p>
        ) : null}

        {paymentMethod === "EWALLET" && paymentInfo.EWALLET ? (
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem" }}>
            Nomor E-Wallet: <strong>{paymentInfo.EWALLET}</strong>
          </p>
        ) : null}

        {paymentMethod === "QRIS" && paymentInfo.QRIS ? (
          <div style={{ marginTop: "0.5rem", border: "1px solid #e2e8f0", borderRadius: 10, padding: "0.4rem", background: "#fff" }}>
            <img src={paymentInfo.QRIS} alt="QRIS pembayaran" style={{ width: "100%", maxWidth: 220, display: "block", margin: "0 auto", borderRadius: 8 }} />
          </div>
        ) : null}

        <button className="btn" style={{ marginTop: "0.75rem", width: "100%" }} onClick={checkout}>Checkout dan Kirim KOT</button>
      </div>
      {error && <p className="status-err">{error}</p>}
      <p style={{ marginTop: "0.3rem" }} className="muted">
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
