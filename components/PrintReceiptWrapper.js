"use client";

import { useState } from "react";
import ReceiptTicket from "./ReceiptTicket";

export default function PrintReceiptWrapper({ order, storeName }) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    // Give state time to update if needed, though hidden print works fine
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 50);
  };

  return (
    <>
      <button 
        onClick={handlePrint}
        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded transition-colors"
        title="Cetak Struk Thermal"
      >
        🖨️ Print
      </button>
      {/* Hidden receipt ticket that will be shown by CSS @media print */}
      <ReceiptTicket order={order} storeName={storeName} />
    </>
  );
}
