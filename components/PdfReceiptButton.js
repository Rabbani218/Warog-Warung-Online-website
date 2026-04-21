"use client";

import { jsPDF } from "jspdf";

export default function PdfReceiptButton({ order }) {
  async function downloadPdf() {
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const title = "Struk Pesanan Wareb";
      doc.setFontSize(22);
      doc.text(title, 40, 50);
      doc.setFontSize(12);
      doc.text(`Order: ${order.orderCode}`, 40, 80);
      doc.text(`Meja: ${order.tableNumber || "-"}`, 40, 100);
      doc.text(`Status Pesanan: ${order.status}`, 40, 120);
      doc.text(`Metode Pembayaran: ${order.paymentMethod || "CASH"}`, 40, 140);
      doc.text(`Subtotal: Rp ${Number(order.subTotal).toLocaleString("id-ID")}`, 40, 180);
      doc.text(`PPN: Rp ${Number(order.taxAmount).toLocaleString("id-ID")}`, 40, 200);
      doc.text(`Total: Rp ${Number(order.grandTotal).toLocaleString("id-ID")}`, 40, 220);
      doc.setFontSize(14);
      doc.text("Daftar Menu:", 40, 260);

      let top = 285;
      order.details.forEach((detail, index) => {
        doc.setFontSize(12);
        doc.text(`${index + 1}. ${detail.menu.name} x${detail.quantity} - Rp ${Number(detail.lineTotal).toLocaleString("id-ID")}`, 40, top);
        top += 18;
      });

      doc.save(`struk-${order.orderCode}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Gagal membuat PDF. Coba lagi.");
    }
  }

  return (
    <button type="button" className="btn" onClick={downloadPdf} style={{ background: "#1d4ed8" }}>
      Download PDF Struk
    </button>
  );
}
