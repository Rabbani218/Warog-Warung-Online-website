"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, Boxes, ChefHat, CreditCard, UserRound, MessageSquare } from "lucide-react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/products", label: "Products & Ads", icon: Boxes },
  { href: "/admin/qna", label: "Inbox QnA", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: CreditCard },
  { href: "/admin/kds", label: "KDS", icon: ChefHat },
  { href: "/admin/profile", label: "Profile", icon: UserRound }
];

export default function AdminTopNav({ currentPath = "" }) {
  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex flex-wrap gap-3">
        {links.map((item) => {
          const Icon = item.icon;
          const active = currentPath.startsWith(item.href);

          return (
            <motion.div key={item.href} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link 
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium ${
                  active 
                    ? "bg-[#FF6B6B] text-white shadow-lg shadow-rose-200" 
                    : "bg-white/50 text-slate-600 hover:bg-white/80"
                }`} 
                href={item.href}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-200 px-2 py-3 flex justify-around md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {links.map((item) => {
          const Icon = item.icon;
          const active = currentPath.startsWith(item.href);

          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all ${
                active ? "text-[#FF6B6B]" : "text-slate-400"
              }`}
            >
              <motion.div
                animate={active ? { scale: 1.2 } : { scale: 1 }}
                className={active ? "bg-rose-50 p-1.5 rounded-lg" : ""}
              >
                <Icon size={20} />
              </motion.div>
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
