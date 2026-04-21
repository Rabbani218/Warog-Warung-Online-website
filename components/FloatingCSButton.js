"use client";

import { MessageCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

export default function FloatingCSButton({ whatsappNumber, onRequireAuth }) {
  const { status } = useSession();

  function handleClick() {
    if (status === "unauthenticated") {
      onRequireAuth();
      return;
    }

    if (!whatsappNumber) {
      alert("Nomor WhatsApp Customer Service belum diatur oleh Admin.");
      return;
    }

    const cleanNumber = whatsappNumber.replace(/\D/g, "");
    const waUrl = `https://wa.me/${cleanNumber.startsWith("0") ? "62" + cleanNumber.slice(1) : cleanNumber}`;
    window.open(waUrl, "_blank");
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-colors"
      style={{ boxShadow: "0 10px 25px rgba(34, 197, 94, 0.4)" }}
    >
      <MessageCircle size={28} />
    </motion.button>
  );
}
