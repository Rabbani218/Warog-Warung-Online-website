"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function AdminMotionShell({ children }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-slate-900 font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-orange-50" />
      {/* Animated Mesh Gradients */}
      <motion.div
        className="absolute w-[60vw] h-[60vw] rounded-full mix-blend-screen filter blur-[100px] opacity-30"
          style={{ background: 'radial-gradient(circle, #FF6B6B 0%, transparent 70%)' }}
        animate={{
          x: [0, 100, -100, 0],
          y: [0, -100, 100, 0],
          scale: [1, 1.1, 0.9, 1]
        }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear", repeatType: "loop" }}
      />
      <motion.div
        className="absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[100px] opacity-30"
          style={{ background: 'radial-gradient(circle, #FF8787 0%, transparent 70%)' }}
        animate={{
          x: [0, -150, 50, 0],
          y: [0, 100, -50, 0],
          scale: [1, 1.2, 0.8, 1]
        }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear", repeatType: "loop" }}
      />
      <motion.div
        className="absolute bottom-0 left-[20%] w-[40vw] h-[40vw] rounded-full mix-blend-screen filter blur-[100px] opacity-20"
          style={{ background: 'radial-gradient(circle, #FFB347 0%, transparent 70%)' }}
        animate={{
          x: [0, 50, -150, 0],
          y: [0, -50, 100, 0],
          scale: [1, 1.1, 0.9, 1]
        }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear", repeatType: "loop" }}
      />

      {/* Noise Texture */}
      <div 
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
