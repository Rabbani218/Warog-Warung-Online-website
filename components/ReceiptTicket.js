"use client";

import { useMemo } from "react";

export default function ReceiptTicket({ order, storeName }) {
  const receiptItems = useMemo(() => {
    if (!order) return [];
    const rawItems = order.details || order.items || order.kot || order.receipt?.items || [];
    return Array.isArray(rawItems) ? rawItems : [];
  }, [order]);

  if (!order) return null;

  const safeReceiptId = `receipt-${String(order.id || order.orderCode || order.invoiceNumber || "default")}`
    .replace(/[^a-zA-Z0-9-_]/g, "-");

  const invoiceNumber = order.invoiceNumber || order.invoice?.invoiceNumber || order.summary?.transaction_code || order.orderCode || "-";
  const paymentMethod = order.paymentMethod || order.summary?.payment_method || "CASH";
  const paymentStatus = order.paymentStatus || order.summary?.payment_status || order.status || "PENDING";
  const orderStatus = order.status || order.summary?.order_status || "PENDING";
  const tableNumber = order.tableNumber || order.summary?.table_number || "-";
  const subTotal = Number(order.subTotal ?? order.summary?.sub_total ?? 0);
  const taxAmount = Number(order.taxAmount ?? order.summary?.ppn_amount ?? 0);
  const grandTotal = Number(order.grandTotal ?? order.summary?.grand_total ?? 0);
  const createdAt = order.createdAt || order.summary?.created_at || Date.now();

  const dateStr = new Date(createdAt).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
            margin: 0;
            padding: 0;
          }

          body[data-print-receipt-id='${safeReceiptId}'] #${safeReceiptId},
          body[data-print-receipt-id='${safeReceiptId}'] #${safeReceiptId} * {
            visibility: visible;
          }

          body[data-print-receipt-id='${safeReceiptId}'] #${safeReceiptId} {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm !important;
            display: block !important;
            background: white !important;
            color: black !important;
          }

          @page {
            margin: 0;
            size: auto;
          }
        }
      `}</style>

      <div
        id={safeReceiptId}
        className="receipt-ticket hidden print:block bg-white text-black font-mono text-[12px] leading-tight z-[9999]"
        style={{ width: "80mm" }}
      >
        <div className="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
          <h2 className="text-lg font-bold uppercase">{storeName || "WAREB PLATFORM"}</h2>
          <p className="text-xs">Struk Pesanan Digital</p>
        </div>

        <div className="space-y-1 mb-2">
          <div className="flex justify-between gap-2">
            <span>Invoice:</span>
            <span className="font-bold break-all text-right">{invoiceNumber}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Order:</span>
            <span className="font-bold break-all text-right">{order.orderCode || "-"}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Meja:</span>
            <span>{tableNumber}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Status:</span>
            <span>{orderStatus}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Pembayaran:</span>
            <span>{paymentMethod}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Payment:</span>
            <span>{paymentStatus}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Waktu:</span>
            <span className="text-right">{dateStr}</span>
          </div>
        </div>

        <div className="border-b border-dashed border-gray-400 mb-2" />

        <div className="space-y-2 mb-2">
          {receiptItems.map((item, idx) => {
            const itemName = item.menu?.name || item.menuName || item.name || `Item ${idx + 1}`;
            const quantity = Number(item.quantity || item.qty || 0);
            const unitPrice = Number(item.price || item.unitPrice || 0);
            const lineTotal = Number(item.lineTotal || unitPrice * quantity || 0);

            return (
              <div key={`${itemName}-${idx}`}>
                <div className="flex justify-between gap-2">
                  <span className="max-w-[70%] break-words">{itemName}</span>
                  <span>x{quantity}</span>
                </div>
                <div className="text-right text-xs opacity-75">
                  Rp {lineTotal.toLocaleString("id-ID")}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-b border-dashed border-gray-400 mb-2" />

        <div className="space-y-1">
          <div className="flex justify-between gap-2">
            <span>Subtotal:</span>
            <span>Rp {subTotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Pajak (PPN):</span>
            <span>Rp {taxAmount.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between gap-2 font-bold text-base pt-1">
            <span>TOTAL:</span>
            <span>Rp {grandTotal.toLocaleString("id-ID")}</span>
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
