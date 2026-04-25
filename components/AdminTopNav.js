"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, Boxes, ChefHat, CreditCard, UserRound, MessageSquare, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/products", label: "Inventory", icon: Boxes },
  { href: "/admin/qna", label: "QnA", icon: MessageSquare },
  { href: "/admin/settings", label: "Payments", icon: CreditCard },
  { href: "/admin/kds", label: "Kitchen", icon: ChefHat },
  { href: "/admin/profile", label: "Profile", icon: UserRound }
];

export default function AdminTopNav() {
  const pathname = usePathname();
  const currentPath = pathname || "";
  return (
    <>
      {/* Floating Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-center pt-2 print:hidden">
        <div className="bg-white/40 backdrop-blur-xl border border-white/40 p-2 rounded-[2rem] shadow-2xl shadow-slate-200/50 flex items-center gap-1">
          {links.map((item) => {
            const Icon = item.icon;
            const active = currentPath.startsWith(item.href);

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 font-bold text-sm ${
                    active 
                      ? "text-white" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-[#FF6B6B] via-[#F5576C] to-[#F093FB] rounded-full shadow-lg shadow-rose-200/50"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </span>
                </motion.div>
              </Link>
            );
          })}
          
          <div className="w-[1px] h-6 bg-slate-200 mx-2" />
          
          <button 
            onClick={() => signOut({ callbackUrl: "/admin" })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Modern Mobile Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90vw] max-w-[400px] md:hidden print:hidden">
        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 px-4 py-3 rounded-[2.5rem] flex justify-around items-center shadow-2xl shadow-slate-300">
          {links.map((item) => {
            const Icon = item.icon;
            const active = currentPath.startsWith(item.href);

            return (
              <Link 
                key={item.href}
                href={item.href}
                className="relative p-2"
              >
                <motion.div
                  animate={{ 
                    scale: active ? 1.1 : 1,
                    color: active ? "#FF6B6B" : "#94a3b8"
                  }}
                  className="flex flex-col items-center gap-1"
                >
                  <Icon size={22} />
                  {active && (
                    <motion.div 
                      layoutId="mobileActiveDot"
                      className="w-1 h-1 bg-[#FF6B6B] rounded-full mt-1"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
