"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#fffafb] flex items-center justify-center p-4">
        <div 
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-rose-100 p-8 border border-rose-50 text-center"
        >
          <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-[#FF6B6B]" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Fatal System Error</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Terjadi kesalahan fatal pada level aplikasi. Kami mohon maaf atas ketidaknyamanan ini.
          </p>

          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 w-full py-4 bg-[#FF6B6B] hover:bg-[#ff5252] text-white rounded-2xl font-semibold transition-all active:scale-95 shadow-lg shadow-rose-200"
          >
            <RefreshCcw className="w-5 h-5" />
            Muat Ulang Aplikasi
          </button>

          <p className="mt-8 text-xs text-gray-400 font-mono opacity-50">
            Critical Failure: {error?.message || "Root Layout Crash"}
          </p>
        </div>
      </body>
    </html>
  );
}
