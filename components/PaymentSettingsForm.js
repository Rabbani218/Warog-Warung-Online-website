"use client";

import { useEffect, useState } from "react";

export default function PaymentSettingsForm() {
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [paymentGatewayKey, setPaymentGatewayKey] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    const response = await fetch("/api/admin/payment-settings", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) {
      setBankAccountNumber(data.bankAccountNumber || "");
      setPaymentGatewayKey(data.paymentGatewayKey || "");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(event) {
    event.preventDefault();
    setStatus("Menyimpan...");

    const response = await fetch("/api/admin/payment-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bankAccountNumber, paymentGatewayKey })
    });

    setStatus(response.ok ? "Pengaturan tersimpan." : "Gagal menyimpan.");
  }

  return (
    <section className="panel" style={{ padding: "1rem" }}>
      <h3 style={{ marginTop: 0 }}>Payment Gateway Settings</h3>
      <form className="grid" onSubmit={save}>
        <label>
          Nomor Rekening
          <input className="input" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} />
        </label>
        <label>
          API Key Gateway (Simulasi)
          <input className="input" value={paymentGatewayKey} onChange={(e) => setPaymentGatewayKey(e.target.value)} />
        </label>
        <button className="btn" type="submit">Simpan</button>
      </form>
      <p>{status}</p>
    </section>
  );
}
