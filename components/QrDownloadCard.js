"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion";
import { Download, QrCode, ArrowRight } from "lucide-react";

export default function QrDownloadCard() {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!origin) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <section className="glass-panel p-12 text-center">
          <QrCode className="mx-auto mb-4 text-slate-300 animate-pulse" size={48} />
          <p className="text-slate-500 font-medium">Menyiapkan URL QR...</p>
        </section>
      </div>
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
    <div className="w-full max-w-4xl mx-auto">
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 md:p-12 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none">
          <QrCode size={200} />
        </div>

        <header className="text-center mb-12">
          <h3 className="retro-title text-3xl text-slate-900 mb-3">QR Code Generator</h3>
          <p className="text-slate-500 max-w-xl mx-auto">
            Cetak dan tempel QR Code di meja pelanggan untuk memudahkan pemesanan instan.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center justify-center">
          {/* Table QR */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="flex flex-col items-center bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <div className="bg-rose-50 p-4 rounded-3xl mb-6">
              <QRCodeCanvas 
                id="table-qr" 
                value={tableUrl} 
                size={180} 
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/icon.png",
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>
            <div className="text-center mb-6">
              <span className="badge mb-2">Area Meja</span>
              <h4 className="text-xl font-bold text-slate-800">QR Meja #4</h4>
              <p className="text-sm text-[#FF6B6B] font-bold mt-2">Scan untuk pesan dari meja ini</p>
            </div>
            <button 
              className="w-full py-3 bg-[#FF6B6B] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#ff5252] transition-all shadow-lg shadow-rose-100" 
              onClick={() => downloadQr("table-qr", "wareb-table-4.png")}
            >
              <Download size={18} /> Download PNG
            </button>
          </motion.div>

          {/* Store QR */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="flex flex-col items-center bg-slate-50/50 p-8 rounded-[2rem] border border-dashed border-slate-300"
          >
            <div className="bg-white p-4 rounded-3xl mb-6 shadow-sm">
              <QRCodeCanvas id="store-qr" value={storeUrl} size={150} level="M" />
            </div>
            <div className="text-center mb-6">
              <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">Link Umum</span>
              <h4 className="text-xl font-bold text-slate-800">URL Toko Utama</h4>
              <p className="text-sm text-slate-400 mt-2">Gunakan untuk promosi sosial media</p>
            </div>
            <button 
              className="w-full py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/80 transition-all shadow-sm" 
              onClick={() => downloadQr("store-qr", "wareb-store.png")}
            >
              <Download size={18} /> Simpan QR Umum
            </button>
          </motion.div>
        </div>

        <footer className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium italic">
          <ArrowRight size={14} /> Tips: Cetak dengan ukuran minimal 5cm untuk keterbacaan optimal.
        </footer>
      </motion.section>
    </div>
  );
}
