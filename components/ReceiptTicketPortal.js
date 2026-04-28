"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ReceiptTicket from "./ReceiptTicket";

export default function ReceiptTicketPortal({ order, storeName }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Create a container div for the portal
    const el = document.createElement("div");
    document.body.appendChild(el);
    containerRef.current = el;
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  // Only render the receipt in the portal
  if (!containerRef.current) return null;
  return createPortal(
    <ReceiptTicket order={order} storeName={storeName} />, 
    containerRef.current
  );
}
