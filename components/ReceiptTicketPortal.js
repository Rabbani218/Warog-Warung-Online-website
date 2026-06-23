"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ReceiptTicket from "./ReceiptTicket";

/**
 * ReceiptTicketPortal — renders ReceiptTicket directly as a child of document.body
 * using React Portal. This completely bypasses any parent containers with
 * overflow:hidden, position:relative, or CSS transforms (from Framer Motion)
 * that would clip or misplace the receipt in the print view.
 */
export default function ReceiptTicketPortal({ order, storeName }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Only render on client after mount — avoids SSR hydration mismatch
  if (!mounted || !order) return null;

  return createPortal(
    <ReceiptTicket order={order} storeName={storeName} />,
    document.body
  );
}
