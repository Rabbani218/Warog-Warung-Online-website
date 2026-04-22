"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Image as ImageIcon, ImageOff, Loader2 } from "lucide-react";

export default function SafeImage({ src, alt, type = "menu", className = "", ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const isValidSrc = src && src?.trim() !== "" && !hasError;

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`} style={{ ...props.style }}>
      <AnimatePresence mode="wait">
        {!isValidSrc ? (
          <motion.div
            key="fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center"
          >
            {type === "menu" ? (
              <div className="flex flex-col items-center gap-2 text-rose-300">
                <UtensilsCrossed size={48} strokeWidth={1.5} />
                <span className="text-xs font-medium uppercase tracking-widest text-rose-400/60">No Image</span>
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-rose-400 via-orange-400 to-amber-300 flex flex-col items-center justify-center p-6">
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 shadow-xl text-center">
                  <ImageIcon className="text-white mx-auto mb-2" size={32} />
                  <p className="text-white font-bold text-sm leading-tight">Promo Menarik<br/>Segera Hadir</p>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="image"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 1.05 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full h-full"
          >
            <Image
              src={src}
              alt={alt || "Image"}
              {...props}
              unoptimized
              onLoad={() => setIsLoaded(true)}
              onError={() => {
                console.error("SafeImage failed to load:", src);
                setHasError(true);
              }}
              className={`object-cover w-full h-full transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${props.className || ""}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isLoaded && isValidSrc && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse" />
      )}
    </div>
  );
}
