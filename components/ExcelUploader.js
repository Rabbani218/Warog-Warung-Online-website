"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudUpload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Save } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export default function ExcelUploader() {
  const [data, setData] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle"); // idle, processing, done

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      toast.error("Format file tidak didukung. Gunakan .xlsx atau .csv");
      return;
    }

    setLoading(true);
    setProgress(10);
    setStatus("processing");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

      if (rows.length === 0) throw new Error("File Excel kosong.");

      setData(rows);
      setPreview(rows.slice(0, 8)); // Show first 8 rows
      setProgress(100);
      toast.success("File berhasil diimpor! Silakan cek pratinjau.");
    } catch (err) {
      toast.error(err.message);
      setStatus("idle");
    } finally {
      setLoading(false);
    }
  }, []);

  async function injectToDatabase() {
    setLoading(true);
    setProgress(30);
    try {
      const response = await fetch("/api/admin/analyze-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: data })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gagal injeksi data.");

      setProgress(100);
      setStatus("done");
      toast.success("Data berhasil diinjeksi ke database!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <section className="glass-panel p-8">
        <header className="mb-8 text-center">
          <h3 className="retro-title text-2xl text-slate-900 mb-2">Excel Data Injection</h3>
          <p className="text-slate-500">Impor data penjualan untuk analisis tren otomatis.</p>
        </header>

        {status === "idle" ? (
          <motion.div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            whileHover={{ scale: 1.01 }}
            className={`relative border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer ${
              isDragging ? "border-[#FF6B6B] bg-rose-50/50" : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
            }`}
          >
            <input
              type="file"
              accept=".xlsx,.csv"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center text-[#FF6B6B]">
              <CloudUpload size={40} />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-700 text-lg">Tarik & Lepaskan File</p>
              <p className="text-slate-400 text-sm">atau klik untuk memilih file (.xlsx, .csv)</p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-rose-400 to-orange-400"
              />
            </div>

            {preview.length > 0 && status === "processing" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <FileSpreadsheet size={18} /> Pratinjau Data ({data.length} baris)
                  </h4>
                  <button 
                    onClick={() => setStatus("idle")}
                    className="text-xs text-rose-500 font-bold hover:underline"
                  >
                    Batal & Ganti File
                  </button>
                </div>
                
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50">
                      <tr>
                        {Object.keys(preview[0]).map((key) => (
                          <th key={key} className="px-4 py-3 font-bold text-slate-600 border-b">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {preview.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="px-4 py-2 text-slate-500">{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={injectToDatabase}
                  disabled={loading}
                  className="w-full py-4 bg-[#FF6B6B] hover:bg-[#ff5252] text-white rounded-2xl font-bold shadow-xl shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                  Simpan ke Database
                </button>
              </div>
            )}

            {status === "done" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-emerald-900">Injeksi Berhasil!</h4>
                  <p className="text-emerald-700">Semua data telah dianalisis dan disimpan ke sistem.</p>
                </div>
                <button 
                  onClick={() => setStatus("idle")}
                  className="px-6 py-2 bg-white border border-emerald-200 text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-all"
                >
                  Unggah Lagi
                </button>
              </motion.div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
