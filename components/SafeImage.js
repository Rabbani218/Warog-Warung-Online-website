"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * SafeImage - A robust image component with shimmer loading and error fallback.
 * Optimized for Base64 and remote URLs.
 */
export default function SafeImage({ src, alt, width = 500, height = 500, className = "", ...props }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
  }, [src]);

  const isBase64 = typeof src === "string" && src.startsWith("data:image/");

  return (
    <div 
      className={`relative overflow-hidden bg-slate-50/50 ${className}`}
      style={{ width: width === "100%" ? "100%" : width, height: height === "100%" ? "100%" : height }}
    >
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="shimmer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
          >
            <div className="w-full h-full animate-shimmer bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 bg-[length:200%_100%]" />
          </motion.div>
        )}
      </AnimatePresence>

      {error || !src ? (
        <div className="flex flex-col items-center justify-center w-full h-full text-slate-200">
          <ImageIcon size={32} strokeWidth={1} />
        </div>
      ) : isBase64 ? (
        <Image
          src={src}
          alt={alt}
          width={typeof width === 'number' ? width : 500}
          height={typeof height === 'number' ? height : 500}
          className={`w-full h-full object-cover object-center transition-opacity duration-700 ${isLoading ? "opacity-0" : "opacity-100"}`}
          onLoadingComplete={() => setIsLoading(false)}
          onError={() => {
            setError(true);
            setIsLoading(false);
          }}
          unoptimized
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-full object-cover object-center transition-opacity duration-700 ${isLoading ? "opacity-0" : "opacity-100"}`}
          onLoadingComplete={() => setIsLoading(false)}
          onError={() => {
            setError(true);
            setIsLoading(false);
          }}
          unoptimized={false}
        />
      )}
    </div>
  );
}
