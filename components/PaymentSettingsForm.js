"use client";

import { useEffect, useState } from "react";
import { Check, Wallet, Landmark, QrCode, Banknote } from "lucide-react";

export default function PaymentSettingsForm() {
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [paymentGatewayKey, setPaymentGatewayKey] = useState("");
  const [status, setStatus] = useState("");
  const [activeMethods, setActiveMethods] = useState({
    qris: true,
    bank: true,
    ewallet: false,
    cash: true
  });

  async function load() {
    const response = await fetch("/api/admin/payment-settings", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) {
      setBankAccountNumber(data.bankAccountNumber || "");
      setPaymentGatewayKey(data.paymentGatewayKey || "");
    }
  }

  useEffect(() => { load(); }, []);

  async function save(event) {
    event.preventDefault();
    setStatus("Menyimpan...");

    const response = await fetch("/api/admin/payment-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bankAccountNumber, paymentGatewayKey })
    });

    if (response.ok) {
      setStatus("Pengaturan tersimpan.");
      setTimeout(() => setStatus(""), 3000);
    } else {
      setStatus("Gagal menyimpan.");
    }
  }

  const toggleMethod = (method) => {
    setActiveMethods(prev => ({ ...prev, [method]: !prev[method] }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="glass-panel p-6">
        <h3 className="retro-title text-xl text-white mb-6">Payment Gateway APIs</h3>
        <form className="flex flex-col gap-5" onSubmit={save}>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Nomor Rekening Default</label>
            <input 
              className="glass-input" 
              value={bankAccountNumber} 
              onChange={(e) => setBankAccountNumber(e.target.value)} 
              placeholder="Misal: BCA 1234567890"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">API Key Gateway (Midtrans/Xendit)</label>
            <input 
              className="glass-input" 
              value={paymentGatewayKey} 
              onChange={(e) => setPaymentGatewayKey(e.target.value)} 
              type="password"
              placeholder="SB-Mid-server-xxx"
            />
          </div>
          <button className="glass-btn-primary self-start mt-2" type="submit">Simpan Kredensial</button>
        </form>
        {status && (
          <div className="mt-4 p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 flex items-center gap-2">
            <Check size={16} /> {status}
          </div>
        )}
      </section>

      <section className="glass-panel p-6">
        <h3 className="retro-title text-xl text-white mb-6">Simulasi Metode Pembayaran</h3>
        <p className="text-gray-400 text-sm mb-6">Aktifkan atau nonaktifkan metode pembayaran yang tersedia di POS/Web App.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            onClick={() => toggleMethod('qris')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${activeMethods.qris ? 'bg-determination-red/20 border-determination-red shadow-[0_0_15px_rgba(255,45,32,0.3)]' : 'bg-black/40 border-white/10 hover:border-white/30'}`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activeMethods.qris ? 'bg-determination-red text-white' : 'bg-white/10 text-gray-400'}`}><QrCode size={20} /></div>
                <div>
                  <h4 className="text-white font-bold">QRIS Dinamis</h4>
                  <p className="text-xs text-gray-400">Otomatisasi</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full ${activeMethods.qris ? 'bg-determination-red' : 'border border-gray-500'}`}></div>
            </div>
          </div>

          <div 
            onClick={() => toggleMethod('bank')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${activeMethods.bank ? 'bg-determination-red/20 border-determination-red shadow-[0_0_15px_rgba(255,45,32,0.3)]' : 'bg-black/40 border-white/10 hover:border-white/30'}`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activeMethods.bank ? 'bg-determination-red text-white' : 'bg-white/10 text-gray-400'}`}><Landmark size={20} /></div>
                <div>
                  <h4 className="text-white font-bold">Transfer Bank</h4>
                  <p className="text-xs text-gray-400">Manual / VA</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full ${activeMethods.bank ? 'bg-determination-red' : 'border border-gray-500'}`}></div>
            </div>
          </div>

          <div 
            onClick={() => toggleMethod('ewallet')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${activeMethods.ewallet ? 'bg-determination-red/20 border-determination-red shadow-[0_0_15px_rgba(255,45,32,0.3)]' : 'bg-black/40 border-white/10 hover:border-white/30'}`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activeMethods.ewallet ? 'bg-determination-red text-white' : 'bg-white/10 text-gray-400'}`}><Wallet size={20} /></div>
                <div>
                  <h4 className="text-white font-bold">E-Wallet</h4>
                  <p className="text-xs text-gray-400">Gopay, OVO, Dana</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full ${activeMethods.ewallet ? 'bg-determination-red' : 'border border-gray-500'}`}></div>
            </div>
          </div>

          <div 
            onClick={() => toggleMethod('cash')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${activeMethods.cash ? 'bg-determination-red/20 border-determination-red shadow-[0_0_15px_rgba(255,45,32,0.3)]' : 'bg-black/40 border-white/10 hover:border-white/30'}`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activeMethods.cash ? 'bg-determination-red text-white' : 'bg-white/10 text-gray-400'}`}><Banknote size={20} /></div>
                <div>
                  <h4 className="text-white font-bold">Tunai / Cash</h4>
                  <p className="text-xs text-gray-400">Bayar di Kasir</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full ${activeMethods.cash ? 'bg-determination-red' : 'border border-gray-500'}`}></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
