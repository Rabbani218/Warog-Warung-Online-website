"use client";

import { useState, useTransition } from "react";
import { updateIngredientStock, createIngredient } from "@/app/(admin)/admin/(protected)/dashboard/actions";
import { toast } from "sonner";
import { Package, Plus, Minus, Loader2, PlusCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InlineInventoryManager({ initialItems }) {
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(initialItems);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", unit: "Gram", initialStock: "" });

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

  async function handleCreate(e) {
    e.preventDefault();
    if (!newItem.name || !newItem.initialStock) return;

    startTransition(async () => {
      const result = await createIngredient(newItem);
      if (result.success) {
        toast.success(`Bahan ${newItem.name} berhasil ditambahkan!`);
        setIsAdding(false);
        setNewItem({ name: "", unit: "Gram", initialStock: "" });
        // Since we use revalidatePath, we don't strictly need to update state manually, 
        // but for immediate feedback without full refresh:
        window.location.reload(); 
      } else {
        toast.error("Gagal menambah bahan: " + result.message);
      }
    });
  }

  return (
    <section className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/30">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-rose-50 text-[#FF6B6B] rounded-2xl flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Manajemen Stok Bahan Baku</h3>
            <p className="text-sm text-slate-500">Edit stok langsung (gram/unit) tanpa pindah halaman.</p>
          </div>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-[#FF6B6B] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#ff5252] transition-all shadow-lg shadow-[#FF6B6B]/20 active:scale-95"
        >
          {isAdding ? <X size={20} /> : <PlusCircle size={20} />}
          {isAdding ? "Batal" : "Tambah Bahan"}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleCreate}
            className="mb-8 overflow-hidden"
          >
            <div className="p-6 bg-rose-50/50 rounded-[2rem] border border-rose-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-rose-400 ml-2">Nama Bahan</label>
                <input 
                  className="w-full bg-white border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#FF6B6B]/20"
                  placeholder="Contoh: Terigu"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-rose-400 ml-2">Satuan</label>
                <select 
                  className="w-full bg-white border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#FF6B6B]/20"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                >
                  <option>Gram</option>
                  <option>Kilogram</option>
                  <option>Liter</option>
                  <option>Unit</option>
                  <option>Pcs</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-rose-400 ml-2">Stok Awal</label>
                <input 
                  type="number"
                  className="w-full bg-white border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#FF6B6B]/20"
                  placeholder="0"
                  value={newItem.initialStock}
                  onChange={(e) => setNewItem({...newItem, initialStock: e.target.value})}
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isPending}
                className="bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Simpan Bahan
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

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
