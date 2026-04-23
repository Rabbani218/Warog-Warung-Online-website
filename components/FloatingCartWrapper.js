"use client";

import { useCart } from "@/lib/CartContext";
import FloatingCart from "@/components/FloatingCart";
import { useEffect, useState } from "react";

export default function FloatingCartWrapper() {
  const { cart, setCart } = useCart();
  const [paymentSettings, setPaymentSettings] = useState(null);

  useEffect(() => {
    // Fetch payment settings from an API if needed, 
    // or just pass null if they are loaded elsewhere.
    // For now, let's fetch default store settings.
    fetch("/api/client/store")
      .then((res) => res.json())
      .then((data) => {
        if (data.paymentSettings) setPaymentSettings(data.paymentSettings);
      })
      .catch((err) => console.error("Failed to fetch store settings", err));
  }, []);

  return (
    <FloatingCart 
      cart={cart} 
      setCart={setCart} 
      paymentSettings={paymentSettings} 
    />
  );
}
