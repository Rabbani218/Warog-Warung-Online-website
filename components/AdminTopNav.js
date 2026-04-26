"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, Boxes, ChefHat, CreditCard, UserRound, MessageSquare, LogOut, Bell } from "lucide-react";
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
    <header className="sticky top-0 z-[100] w-full print:hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <nav className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] px-4 py-2.5 flex items-center justify-between transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
          {/* Logo / Title Area */}
          <div className="flex items-center gap-4 pl-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B6B] via-[#F5576C] to-[#F093FB] rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200 ring-2 ring-white/50">
              <ChefHat className="text-white" size={20} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none uppercase">Wareb <span className="text-[#FF6B6B]">V2</span></h1>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">Admin Control Center</p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-50/50 p-1 rounded-[1.75rem] border border-slate-100/50">
            {links.map((item) => {
              const Icon = item.icon;
              const active = currentPath.startsWith(item.href);

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 font-black text-xs uppercase tracking-tight ${
                      active 
                        ? "text-white" 
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeNavHighlight"
                        className="absolute inset-0 bg-gradient-to-r from-[#FF6B6B] via-[#F5576C] to-[#F093FB] rounded-full shadow-lg shadow-rose-200/50"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 pr-2">
            <button className="hidden sm:flex w-10 h-10 items-center justify-center rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
              <Bell size={20} />
            </button>
            
            <div className="w-[1px] h-6 bg-slate-200 mx-2 hidden sm:block" />
            
            <button 
              onClick={() => signOut({ callbackUrl: "/admin" })}
              className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-5 sm:py-2.5 rounded-2xl bg-slate-50 text-slate-500 hover:bg-rose-500 hover:text-white transition-all duration-300 font-black text-xs uppercase tracking-widest group"
            >
              <span className="hidden sm:inline mr-2 group-hover:mr-3 transition-all">Logout</span>
              <LogOut size={18} />
            </button>
          </div>
        </nav>
      </div>

      {/* Modern Mobile Bottom Navigation (Refined) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[92vw] max-w-[420px] lg:hidden print:hidden">
        <div className="bg-white/80 backdrop-blur-3xl border border-white/50 px-6 py-4 rounded-[3rem] flex justify-between items-center shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
          {links.map((item) => {
            const Icon = item.icon;
            const active = currentPath.startsWith(item.href);

            return (
              <Link 
                key={item.href}
                href={item.href}
                className="relative"
              >
                <motion.div
                  animate={{ 
                    scale: active ? 1.2 : 1,
                    y: active ? -4 : 0
                  }}
                  className={`flex flex-col items-center gap-1.5 transition-colors ${active ? "text-[#FF6B6B]" : "text-slate-400"}`}
                >
                  <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                  {active && (
                    <motion.div 
                      layoutId="mobileActiveIndicator"
                      className="w-1.5 h-1.5 bg-[#FF6B6B] rounded-full"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

