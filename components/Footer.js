"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Footer() {
  const [showSecret, setShowSecret] = useState(false);
  const [charaMode, setCharaMode] = useState(false);
  const [clickCount, setClickCount] = useState(0);

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

  // Reset click count after 2 seconds of inactivity
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 2000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  return (
    <footer className="w-full py-8 mt-12 border-t border-slate-200 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 text-center">
        <p className="text-slate-600 font-medium">
          Universitas Bina Sarana Informatika - Jurusan Informatika.
        </p>
        <p className="text-slate-400 text-sm mt-2">
          © 2026 Wareb Platform. All rights{" "}
          <span
            className="cursor-pointer hover:text-slate-600 transition-colors"
            onClick={handleReservedClick}
            onDoubleClick={() => setShowSecret(true)}
          >
            reserved
          </span>
          .
        </p>
      </div>

      <AnimatePresence>
        {showSecret && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-6 font-mono"
            style={{ color: charaMode ? "#ff0000" : "#ffffff" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-2xl w-full text-center space-y-6"
            >
              <h2 className="text-xl md:text-2xl mb-8">
                {charaMode 
                  ? "Dibuat oleh Entitas yang Terlupakan dari Kelas 15.4E.01:" 
                  : "Dibuat oleh Mahasiswa Informatika Universitas Bina Sarana Informatika Kelas 15.4E.01:"}
              </h2>

              <div className="space-y-4 text-left md:text-center">
                <p 
                  className={`cursor-pointer transition-all ${charaMode ? "text-red-500 font-bold scale-110" : "hover:text-yellow-400"}`}
                  onClick={() => setCharaMode(true)}
                >
                  1. {charaMode ? "Muhammad Hanif Al Ihsani (15240969)" : "Muhammad Abdurrahman Rabbani (15240969)"}
                </p>
                <p>2. Mario Sangap (15241061)</p>
                <p>3. Wili Rijki A. (15241085)</p>
              </div>

              <div className="pt-6 border-t border-white/20">
                <h3 className="text-lg mb-4">"The Party:"</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm opacity-80">
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

              <div className="mt-12 pt-8 flex flex-col items-center">
                {charaMode ? (
                  <>
                    <del className="text-gray-400 block mb-2">Obey & Survive, To protect and to serve</del>
                    <motion.div 
                      animate={{ opacity: [1, 0.5, 1], scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-red-600 font-extrabold text-2xl tracking-widest"
                    >
                      It's Me =)
                    </motion.div>
                  </>
                ) : (
                  <p className="italic opacity-60">"Despite everything, it's still you."</p>
                )}
                
                <button 
                  onClick={() => {
                    setShowSecret(false);
                    setCharaMode(false);
                  }}
                  className="mt-12 px-6 py-2 border border-current hover:bg-white hover:text-black transition-colors uppercase tracking-widest text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
