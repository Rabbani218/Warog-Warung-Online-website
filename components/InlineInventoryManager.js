"use client";

import { useState, useTransition } from "react";
import { updateIngredientStock } from "@/app/(admin)/admin/(protected)/dashboard/actions";
import { toast } from "sonner";
import { Package, Plus, Minus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function InlineInventoryManager({ initialItems }) {
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(initialItems);

  async function handleUpdate(id, currentQty, delta) {
    const newQty = Math.max(0, parseFloat(currentQty) + delta);
    
    // Optimistic Update
    const oldItems = [...items];
    setItems(items.map(it => it.ingredientId === id ? { ...it, currentStock: newQty } : it));

    startTransition(async () => {
      const result = await updateIngredientStock(id, newQty);
      if (result.success) {
        toast.success(`Stok ${result.name} diperbarui menjadi ${newQty}`);
      } else {
        setItems(oldItems);
        toast.error("Gagal memperbarui stok: " + result.message);
      }
    });
  }

  return (
    <section className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/30">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-rose-50 text-[#FF6B6B] rounded-2xl flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Manajemen Stok Bahan Baku</h3>
            <p className="text-sm text-slate-500">Edit stok langsung (gram/unit) tanpa pindah halaman.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((item) => (
          <motion.div 
            key={item.ingredientId}
            whileHover={{ y: -4 }}
            className="p-6 bg-white/80 border border-slate-100 rounded-3xl shadow-sm space-y-4 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800">{item.ingredientName}</h4>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                    item.alertLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {item.alertLevel}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{item.unit}</span>
                </div>
              </div>
              
              <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                <button 
                  onClick={() => handleUpdate(item.ingredientId, item.currentStock, -1)}
                  disabled={isPending}
                  className="p-1.5 hover:bg-white hover:text-rose-500 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Minus size={14} />
                </button>
                <span className="px-3 font-black text-sm text-slate-700 min-w-[3rem] text-center">
                  {parseFloat(item.currentStock).toLocaleString("id-ID")}
                </span>
                <button 
                  onClick={() => handleUpdate(item.ingredientId, item.currentStock, 1)}
                  disabled={isPending}
                  className="p-1.5 hover:bg-white hover:text-[#FF6B6B] rounded-lg transition-colors disabled:opacity-50"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (item.currentStock / (item.burnRatePerDay * 7 || 1)) * 100)}%` }}
                  className={`h-full transition-all duration-500 ${
                    item.alertLevel === 'CRITICAL' ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                  }`}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Status Stok</span>
                <span>{item.alertLevel === 'CRITICAL' ? 'Butuh Belanja' : 'Aman'}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
