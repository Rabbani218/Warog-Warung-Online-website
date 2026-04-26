"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import AdminTopNav from "@/components/AdminTopNav";

export default function AdminMotionShell({ children }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-[#fafafa]" />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafafa] text-slate-900 font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Dynamic Rainbow Mesh Background */}
      <div className="fixed inset-0 z-0 bg-[#fafafa] print:hidden">
        {/* Layer 1: Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-50/50 via-white to-blue-50/50" />
        
        {/* Layer 2: Animated Orbs (The Rainbow) */}
        <motion.div
          className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.15]"
          style={{ background: 'radial-gradient(circle, #FF6B6B 0%, transparent 70%)' }}
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-[20%] -right-[10%] w-[45vw] h-[45vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, #4FACFE 0%, transparent 70%)' }}
          animate={{ x: [0, -40, 0], y: [0, 50, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-[10%] left-[10%] w-[40vw] h-[40vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.1]"
          style={{ background: 'radial-gradient(circle, #F093FB 0%, transparent 70%)' }}
          animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #00F2FE 0%, transparent 70%)' }}
          animate={{ x: [0, -30, 0], y: [0, -60, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Subtle Noise Overlay for Texture */}
      <div 
        className="fixed inset-0 z-[1] opacity-[0.03] mix-blend-overlay pointer-events-none print:hidden"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full min-h-screen max-w-full overflow-x-hidden">
        <AdminTopNav />
        <main
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-24 md:pb-12 max-w-[1440px] overflow-hidden"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
