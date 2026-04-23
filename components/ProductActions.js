"use client";

import { useState } from "react";
import { ShoppingBag, Share2, CheckCircle2 } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductActions({ product }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleOrder = () => {
    addToCart(product);
    setIsAdded(true);
    toast.success(`${product.name} ditambahkan ke keranjang!`);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.description || `Cek menu lezat ini: ${product.name}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.info("Link produk berhasil disalin ke clipboard!");
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  return (
    <div className="pt-8 space-y-6">
      <div className="flex gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleOrder}
          disabled={!product.isAvailable}
          className={`flex-1 py-6 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-3 transition-all shadow-2xl group ${
            isAdded 
              ? "bg-emerald-500 text-white shadow-emerald-200" 
              : "bg-[#FF6B6B] hover:bg-[#ff5252] text-white shadow-rose-200"
          } disabled:opacity-50`}
        >
          {isAdded ? (
            <>
              <CheckCircle2 size={24} className="animate-bounce" />
              Berhasil Dipesan!
            </>
          ) : (
            <>
              <ShoppingBag size={24} className="group-hover:rotate-12 transition-transform" />
              Pesan Sekarang
            </>
          )}
        </motion.button>
        
        <button 
          onClick={handleShare}
          className="w-20 bg-white border border-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all hover:shadow-lg active:scale-90"
          title="Bagikan Produk"
        >
          <Share2 size={24} />
        </button>
      </div>
    </div>
  );
}
