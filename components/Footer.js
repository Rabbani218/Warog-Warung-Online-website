"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Heart, Terminal } from "lucide-react";

export default function Footer() {
  const [showSecret, setShowSecret] = useState(false);
  const [charaMode, setCharaMode] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [adminClicks, setAdminClicks] = useState(0);

  const handleReservedClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setShowSecret(true);
        return 0;
      }
      return next;
    });
  };

  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 2000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  useEffect(() => {
    if (adminClicks > 0) {
      const timer = setTimeout(() => setAdminClicks(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [adminClicks]);

  const handleLogoClick = () => {
    setAdminClicks((prev) => {
      const next = prev + 1;
      if (next >= 7) {
        window.location.href = "/admin";
        return 0;
      }
      return next;
    });
  };

  return (
    <footer className="w-full pt-20 pb-10 mt-24 relative overflow-hidden bg-white/30 backdrop-blur-xl border-t border-slate-100">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Brand/Logo Area */}
          <div 
            className="flex flex-col items-center gap-3 cursor-pointer select-none active:scale-95 transition-transform"
            onClick={handleLogoClick}
          >
            <div className="w-12 h-12 bg-[#FF6B6B]/10 rounded-2xl flex items-center justify-center text-[#FF6B6B]">
              <GraduationCap size={24} />
            </div>
            <div>
              <h4 className="font-black text-slate-900 tracking-tight">Wareb Platform</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Next-Gen POS & Ecommerce</p>
            </div>
          </div>

          {/* Links & Info */}
          <div className="space-y-2">
            <p className="text-slate-600 font-bold text-sm">
              Universitas Bina Sarana Informatika - Jurusan Informatika.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-400">
              <span>Jakarta, Indonesia</span>
              <span className="w-1 h-1 bg-slate-200 rounded-full" />
              <span>Project V2.7</span>
            </div>
          </div>

          {/* Copyright Area */}
          <div className="pt-8 w-full border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
              © 2026 Wareb Platform. All rights{" "}
              <span
                className="cursor-help hover:text-[#FF6B6B] transition-colors"
                onClick={handleReservedClick}
              >
                reserved
              </span>
              .
            </p>
            <div className="flex items-center gap-1 text-[11px] text-slate-300 font-bold uppercase tracking-widest">
              Made with <Heart size={12} className="text-[#FF6B6B] fill-[#FF6B6B]" /> by The UBSI Squad
            </div>
          </div>
        </div>
      </div>

      {/* Easter Egg Overlay */}
      <AnimatePresence>
        {showSecret && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black flex items-center justify-center p-6 font-mono overflow-y-auto"
            style={{ color: charaMode ? "#ff0000" : "#ffffff" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-2xl w-full text-center space-y-8"
            >
              <div className="flex justify-center">
                <Terminal size={48} className={charaMode ? "animate-pulse" : ""} />
              </div>

              <h2 className="text-xl md:text-2xl font-bold tracking-tight leading-relaxed">
                {charaMode 
                  ? "Dibuat oleh Entitas yang Terlupakan dari Kelas 15.4E.01:" 
                  : "Dibuat oleh Mahasiswa Informatika Universitas Bina Sarana Informatika Kelas 15.4E.01:"}
              </h2>

              <div className="space-y-4 text-left md:text-center text-lg">
                <p 
                  className={`cursor-pointer transition-all ${charaMode ? "text-red-500 font-black scale-125" : "hover:text-yellow-400"}`}
                  onClick={() => setCharaMode(true)}
                >
                  1. {charaMode ? "Muhammad Hanif Al Ihsani (15240969)" : "Muhammad Abdurrahman Rabbani (15240969)"}
                </p>
                <p>2. Mario Sangap (15241061)</p>
                <p>3. Wili Rijki A. (15241085)</p>
              </div>

              <div className="pt-8 border-t border-white/20">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-white/50">The Party:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm opacity-80">
                  <p className={charaMode ? "text-red-500 font-bold" : ""}>
                    4. {charaMode ? "Sabil Pangestu Samosir (15241004)" : "Ananda Kurniawan (15241004)"}
                  </p>
                  <p>5. Yoga Bagaskara (15241077)</p>
                  <p>6. Lukas Frans Tambunan (15241071)</p>
                  <p>7. Tri Erlita</p>
                  <p>8. Chayla Azzahra</p>
                  <p>9. M. Fatih Maulidhani</p>
                  <p>10. Galuyy, Faqih, serta lainnya.</p>
                </div>
              </div>

              <div className="mt-12 flex flex-col items-center gap-6">
                {charaMode ? (
                  <motion.div 
                    animate={{ opacity: [1, 0.5, 1], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-red-600 font-black text-4xl tracking-widest"
                  >
                    It&apos;s Me =)
                  </motion.div>
                ) : (
                  <p className="italic opacity-60 text-sm">&quot;Despite everything, it&apos;s still you.&quot;</p>
                )}
                
                <button 
                  onClick={() => {
                    setShowSecret(false);
                    setCharaMode(false);
                  }}
                  className="px-10 py-3 border-2 border-current hover:bg-white hover:text-black transition-all uppercase font-bold tracking-[0.3em] text-xs"
                >
                  Return to Reality
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
