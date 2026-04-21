"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

export default function ExcelUploader() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setSummary(null);
    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

      const response = await fetch("/api/admin/analyze-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal memproses file.");
      }

      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel" style={{ padding: "1rem" }}>
      <h3 style={{ marginTop: 0 }}>Excel Data Injection & Auto-Analysis</h3>
      <p style={{ color: "#6b7280" }}>Upload file .xlsx atau .csv untuk analisis tren penjualan.</p>
      <input type="file" accept=".xlsx,.csv" className="input" onChange={handleFile} />
      {loading && <p>Memproses data...</p>}
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      {summary && (
        <div className="grid" style={{ marginTop: "1rem" }}>
          <div className="badge" style={{ width: "fit-content" }}>Total Baris: {summary.totalRows}</div>
          <div>
            <strong>Tren Penjualan Bulanan</strong>
            <ul>
              {summary.monthlyTrend.map((item) => (
                <li key={item.month}>{item.month}: Rp {Number(item.revenue).toLocaleString("id-ID")}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Menu Terlaris</strong>
            <ul>
              {summary.topMenus.map((item) => (
                <li key={item.menuName}>{item.menuName} - {item.quantity} porsi</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
