"use client";

import { useState } from "react";
import ReceiptTicketPortal from "./ReceiptTicketPortal";

export default function PrintReceiptWrapper({ order, storeName }) {
  const [isPrinting, setIsPrinting] = useState(false);
  const safeReceiptId = `receipt-${String(order?.id || order?.orderCode || order?.invoiceNumber || "default")}`
    .replace(/[^a-zA-Z0-9-_]/g, "-");

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 50);
  };

  return (
    <>
      <button 
        onClick={handlePrint}
        className="no-print print:hidden text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded transition-colors"
        title="Cetak Struk Thermal"
      >
        🖨️ Print
      </button>
      {/* Hidden receipt ticket that will be shown by CSS @media print */}
      <ReceiptTicketPortal order={order} storeName={storeName} />
    </>
  );
}
