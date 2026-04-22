"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, CreditCard, Trash2, Plus, Minus, Receipt, CheckCircle2, ChevronRight } from "lucide-react";
import { enqueueCheckout, flushCheckoutQueue, getQueueItems } from "@/lib/offline-queue";
import ReceiptTicket from "@/components/ReceiptTicket";

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
      setError("Offline mode: pesanan disimpan ke antrean lokal.");
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
      setError("Koneksi terputus. Pesanan disimpan offline.");
      await refreshOfflineCount();
    }
  }

  const paymentInfo = {
    QRIS: paymentSettings?.qrisImageUrl || "",
    TRANSFER: paymentSettings?.bankAccount || "",
    EWALLET: paymentSettings?.ewalletNumber || ""
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/40 p-6 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF6B6B]/10 rounded-xl flex items-center justify-center text-[#FF6B6B]">
              <ShoppingCart size={20} />
            </div>
            <h3 className="font-bold text-slate-900">Keranjang</h3>
          </div>
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
            {cart.length} Item
          </span>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
          <AnimatePresence mode="popLayout">
            {cart.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center space-y-2"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto opacity-50">
                  <ShoppingCart size={24} className="text-slate-300" />
                </div>
                <p className="text-sm text-slate-400">Keranjang masih kosong</p>
              </motion.div>
            ) : (
              cart.map((item) => (
                <motion.div 
                  key={item.menuId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className="flex items-center justify-between gap-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                    <p className="text-xs text-[#FF6B6B] font-bold">
                      Rp {Number(item.price).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                    <button 
                      onClick={() => updateQty(item.menuId, item.quantity - 1)}
                      className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQty(item.menuId, item.quantity + 1)}
                      className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {cart.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 pt-4 border-t border-dashed border-slate-200"
          >
            <div className="flex items-center justify-between text-lg">
              <span className="text-slate-500 font-medium text-sm">Subtotal</span>
              <strong className="text-slate-900">Rp {total.toLocaleString("id-ID")}</strong>
            </div>

            <div className="space-y-3">
              <input 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 transition-all" 
                placeholder="Nomor meja (opsional)" 
                value={tableNumber} 
                onChange={(e) => setTableNumber(e.target.value)} 
              />
              
              <div className="relative">
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 transition-all cursor-pointer" 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="CASH">Tunai (Bayar di Kasir)</option>
                  <option value="QRIS">QRIS / E-Wallet</option>
                  <option value="TRANSFER">Transfer Bank</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronRight size={14} className="rotate-90" />
                </div>
              </div>

              {paymentMethod === "QRIS" && paymentInfo.QRIS && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-col items-center gap-2 shadow-inner"
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scan untuk Bayar</p>
                  <Image src={paymentInfo.QRIS} alt="QRIS" width={160} height={160} className="rounded-lg shadow-sm" unoptimized={paymentInfo.QRIS.startsWith('data:')} />
                </motion.div>
              )}

              <button 
                className="w-full bg-[#FF6B6B] hover:bg-[#ff5252] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#FF6B6B]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                onClick={checkout}
              >
                Checkout Pesanan
                <CreditCard size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {error && (
          <p className="text-center text-xs font-bold text-red-500 bg-red-50 py-2 rounded-xl">
            {error}
          </p>
        )}

        {offlineCount > 0 && (
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            {offlineCount} Pesanan dalam Antrean Offline
          </div>
        )}
      </motion.div>

      {/* Invoice Success Display */}
      <AnimatePresence>
        {invoice && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-600 text-white rounded-[2rem] p-6 shadow-xl shadow-emerald-200 space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} />
              <h3 className="font-bold text-lg">Pesanan Berhasil!</h3>
            </div>

            <div className="space-y-2 bg-white/10 p-4 rounded-2xl border border-white/10 text-sm">
              <div className="flex justify-between">
                <span className="opacity-70">Invoice</span>
                <span className="font-bold">#{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Kode Order</span>
                <span className="font-bold">{invoice.orderCode}</span>
              </div>
              <div className="flex justify-between text-base pt-2 border-t border-white/10 mt-2">
                <span>Total</span>
                <span className="font-bold">Rp {Number(invoice.grandTotal).toLocaleString("id-ID")}</span>
              </div>
            </div>

            <button 
              className="w-full bg-white text-emerald-600 font-bold py-3 rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
              onClick={() => window.print()}
            >
              <Receipt size={18} />
              Cetak Struk Thermal
            </button>
            <ReceiptTicket order={invoice} storeName="WAREB PLATFORM" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
