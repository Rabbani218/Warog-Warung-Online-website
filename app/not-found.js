"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-[#FF6B6B]/10 blur-[100px] rounded-full" />
          <Ghost size={120} className="mx-auto text-[#FF6B6B] animate-bounce" />
          <h1 className="text-9xl font-black text-slate-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
            404
          </h1>
        </motion.div>

        <div className="space-y-4">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Halaman Hilang!</h2>
          <p className="text-slate-500 font-medium">
            Sepertinya menu atau halaman yang Anda cari sedang tidak tersedia di etalase kami.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/"
            className="w-full sm:w-auto px-8 py-4 bg-[#FF6B6B] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-[#ff5252] transition-all shadow-xl shadow-rose-100 active:scale-95"
          >
            <Home size={18} />
            KEMBALI KE BERANDA
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95"
          >
            <ArrowLeft size={18} />
            KEMBALI
          </button>
        </div>

        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest pt-8">
          Warung Digital Wareb Platform
        </p>
      </div>
    </div>
  );
}
