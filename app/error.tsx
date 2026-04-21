"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("System crash captured:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#fffafb]">
      <section 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-rose-100 p-8 border border-rose-50 text-center animate-in fade-in zoom-in duration-500"
      >
        <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-[#FF6B6B]" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Terjadi Gangguan Sistem</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Maaf, aplikasi mengalami masalah saat memproses permintaan Anda. Jangan khawatir, data Anda tetap aman.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 w-full py-4 bg-[#FF6B6B] hover:bg-[#ff5252] text-white rounded-2xl font-semibold transition-all active:scale-95 shadow-lg shadow-rose-200"
          >
            <RefreshCcw className="w-5 h-5" />
            Coba Lagi
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl font-semibold transition-all"
          >
            <Home className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-50">
          <p className="text-xs text-gray-400 font-mono break-all opacity-60">
            Error ID: {error?.digest || "unknown_system_fault"}
          </p>
        </div>
      </section>
    </main>
  );
}
