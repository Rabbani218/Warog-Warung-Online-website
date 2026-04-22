"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, Loader2, Send, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { submitReviewAction } from "@/app/(client)/actions";

export default function ReviewSection({ menu, reviews, onRequireAuth }) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const menuReviews = useMemo(() => {
    if (!menu?.id) return reviews;
    return reviews.filter(r => r.menuId === menu.id);
  }, [reviews, menu?.id]);
  const averageRating = useMemo(() => 
    menuReviews.length > 0 
      ? (menuReviews.reduce((sum, r) => sum + r.rating, 0) / menuReviews.length).toFixed(1)
      : 0
  , [menuReviews]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === "unauthenticated") {
      onRequireAuth();
      return;
    }

    if (!rating || !menu?.id) return;
    setIsSubmitting(true);
    
    try {
      await submitReviewAction(menu.id, rating, comment);
      setComment("");
      setRating(5);
    } catch (error) {
      alert(error.message || "Gagal mengirim ulasan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-8 pt-8 border-t border-slate-100">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-between w-full p-4 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-sm font-bold">
            <Star size={14} className="fill-amber-400" />
            <span>{averageRating > 0 ? averageRating : "4.8"}</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="font-bold text-slate-900 text-sm">Ulasan Pelanggan</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{menuReviews.length} Feedback</span>
          </div>
        </div>
        <div className={`p-2 rounded-full bg-slate-50 text-slate-400 group-hover:text-[#FF6B6B] group-hover:bg-rose-50 transition-all ${isOpen ? 'rotate-180' : ''}`}>
          <MessageSquare size={18} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-6 space-y-6">
              {/* Review List */}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-hide">
                {menuReviews.length > 0 ? (
                  menuReviews.map(r => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={r.id} 
                      className="p-5 bg-white border border-slate-50 rounded-3xl shadow-sm space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                            <User size={16} />
                          </div>
                          <span className="font-bold text-sm text-slate-800">{r.user?.name || "Pelanggan Wareb"}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-100"} />
                          ))}
                        </div>
                      </div>
                      {r.comment && <p className="text-sm text-slate-500 leading-relaxed italic">&ldquo;{r.comment}&rdquo;</p>}
                    </motion.div>
                  ))
                ) : (
                  <div className="py-12 text-center space-y-3 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <Star size={32} className="mx-auto text-slate-200" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Belum ada ulasan untuk menu ini</p>
                  </div>
                )}
              </div>

              {/* Add Review Form */}
              <form onSubmit={handleSubmit} className="p-6 bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B6B]/20 rounded-full blur-3xl" />
                <div className="relative z-10 space-y-4">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Beri Rating Anda</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => status === "unauthenticated" ? onRequireAuth() : setRating(star)}
                          className="focus:outline-none hover:scale-110 transition-transform"
                        >
                          <Star size={28} className={star <= rating ? "fill-amber-400 text-amber-400" : "text-white/20"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={status === "unauthenticated" ? "Login untuk memberi ulasan..." : "Tulis pendapat Anda tentang menu ini..."}
                      className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/40 transition-all"
                      value={comment}
                      readOnly={status === "unauthenticated"}
                      onClick={() => status === "unauthenticated" && onRequireAuth()}
                      onChange={(e) => setComment(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <button 
                      type="submit" 
                      disabled={isSubmitting || status === "unauthenticated" || !comment?.trim()} 
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#FF6B6B] text-white p-2.5 rounded-xl hover:bg-[#ff5252] transition-all disabled:opacity-50 disabled:grayscale"
                    >
                      {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
