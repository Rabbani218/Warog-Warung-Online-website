"use client";

import { useMemo } from "react";
import { jsPDF } from "jspdf";

export default function PdfReceiptButton({ order }) {
  const receiptItems = useMemo(() => {
    const rawItems = order?.details || order?.items || order?.kot || order?.receipt?.items || [];
    return Array.isArray(rawItems) ? rawItems : [];
  }, [order]);

  const invoiceNumber = order?.invoiceNumber || order?.invoice?.invoiceNumber || order?.orderCode || "-";
  const paymentMethod = order?.paymentMethod || order?.summary?.payment_method || "CASH";
  const paymentStatus = order?.paymentStatus || order?.summary?.payment_status || order?.status || "PENDING";
  const orderStatus = order?.status || order?.summary?.order_status || "PENDING";
  const tableNumber = order?.tableNumber || order?.summary?.table_number || "-";
  const subTotal = Number(order?.subTotal ?? order?.summary?.sub_total ?? 0);
  const taxAmount = Number(order?.taxAmount ?? order?.summary?.ppn_amount ?? 0);
  const grandTotal = Number(order?.grandTotal ?? order?.summary?.grand_total ?? 0);

  async function downloadPdf() {
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const title = "Struk Pesanan Wareb";
      doc.setFontSize(22);
      doc.text(title, 40, 50);
      doc.setFontSize(12);
      doc.text(`Invoice: ${invoiceNumber}`, 40, 80);
      doc.text(`Order: ${order?.orderCode || "-"}`, 40, 100);
      doc.text(`Meja: ${tableNumber}`, 40, 120);
      doc.text(`Status Pesanan: ${orderStatus}`, 40, 140);
      doc.text(`Payment: ${paymentStatus}`, 40, 160);
      doc.text(`Metode Pembayaran: ${paymentMethod}`, 40, 180);
      doc.text(`Subtotal: Rp ${subTotal.toLocaleString("id-ID")}`, 40, 220);
      doc.text(`PPN: Rp ${taxAmount.toLocaleString("id-ID")}`, 40, 240);
      doc.text(`Total: Rp ${grandTotal.toLocaleString("id-ID")}`, 40, 260);
      doc.setFontSize(14);
      doc.text("Daftar Menu:", 40, 300);

      let top = 325;
      receiptItems.forEach((detail, index) => {
        const name = detail.menu?.name || detail.menuName || detail.name || `Item ${index + 1}`;
        const quantity = Number(detail.quantity || detail.qty || 0);
        const lineTotal = Number(detail.lineTotal || Number(detail.price || detail.unitPrice || 0) * quantity || 0);
        doc.setFontSize(12);
        doc.text(`${index + 1}. ${name} x${quantity} - Rp ${lineTotal.toLocaleString("id-ID")}`, 40, top);
        top += 18;
      });

      doc.save(`struk-${order?.orderCode || invoiceNumber}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Gagal membuat PDF. Coba lagi.");
    }
  }

  return (
    <button type="button" className="btn no-print" onClick={downloadPdf} style={{ background: "#1d4ed8" }}>
      Download PDF Struk
    </button>
  );
}
