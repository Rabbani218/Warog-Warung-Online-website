"use client";

import { motion } from "framer-motion";

export default function AdminHeader({ badge, title, description, badgeColor = "rose" }) {
  const colorClasses = {
    rose: "text-rose-500 from-[#FF6B6B] to-[#F093FB]",
    indigo: "text-indigo-500 from-indigo-500 to-blue-600",
    emerald: "text-emerald-500 from-emerald-500 to-teal-600",
    amber: "text-amber-500 from-amber-500 to-orange-500",
  };

  const selectedColor = colorClasses[badgeColor] || colorClasses.rose;

  return (
    <header className="relative pb-8 border-b border-slate-200/60">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-1 bg-gradient-to-r ${selectedColor.split(' ').slice(1).join(' ')} rounded-full`} />
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${selectedColor.split(' ')[0]}`}>
              {badge}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
            {title}
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/50 backdrop-blur-md border border-white rounded-2xl shadow-sm flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">System Live</span>
          </div>
        </div>
      </motion.div>
    </header>
  );
}
