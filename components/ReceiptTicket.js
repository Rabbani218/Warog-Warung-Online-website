"use client";

import { useMemo } from "react";

export default function ReceiptTicket({ order, storeName }) {
  if (!order) return null;

  const dateStr = new Date(order.createdAt || Date.now()).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  return (
    <>
      <style jsx global>{`
        @media print {
          body { visibility: hidden; background: white !important; }
          #receipt-area { 
            visibility: visible; 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 80mm !important;
            margin: 0 !important;
            padding: 20px !important;
          }
        }
      `}</style>
      <div id="receipt-area" className="receipt-ticket hidden print:block bg-white text-black font-mono text-[12px] leading-tight z-[9999]" style={{ width: "80mm" }}>
      <div className="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
        <h2 className="text-lg font-bold uppercase">{storeName || "WAREB PLATFORM"}</h2>
        <p className="text-xs">Struk Pesanan Digital</p>
      </div>

      <div className="space-y-1 mb-2">
        <div className="flex justify-between">
          <span>Order:</span>
          <span className="font-bold">{order.orderCode}</span>
        </div>
        <div className="flex justify-between">
          <span>Meja:</span>
          <span>{order.tableNumber || "-"}</span>
        </div>
        <div className="flex justify-between">
          <span>Waktu:</span>
          <span>{dateStr}</span>
        </div>
      </div>

      <div className="border-b border-dashed border-gray-400 mb-2"></div>

      <div className="space-y-2 mb-2">
        {order.details?.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between">
              <span className="max-w-[70%]">{item.menu?.name || item.name}</span>
              <span>x{item.quantity}</span>
            </div>
            <div className="text-right text-xs opacity-75">
              Rp {(Number(item.price || item.unitPrice) * item.quantity).toLocaleString("id-ID")}
            </div>
          </div>
        ))}
      </div>

      <div className="border-b border-dashed border-gray-400 mb-2"></div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>Rp {Number(order.subTotal || 0).toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Pajak (PPN):</span>
          <span>Rp {Number(order.taxAmount || 0).toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between font-bold text-base pt-1">
          <span>TOTAL:</span>
          <span>Rp {Number(order.grandTotal || 0).toLocaleString("id-ID")}</span>
        </div>
      </div>

      <div className="mt-6 text-center text-xs space-y-1 border-t border-dashed border-gray-400 pt-4">
        <p>Terima kasih sudah mampir!</p>
        <p>Silakan berkunjung kembali.</p>
        <p className="mt-2 text-[10px] opacity-50">Powered by Wareb Platform</p>
      </div>
      </div>
    </>
  );
}
