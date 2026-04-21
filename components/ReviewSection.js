"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, Loader2, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { submitReviewAction } from "@/app/(client)/actions";

export default function ReviewSection({ menu, reviews, onRequireAuth }) {
  const { status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const menuReviews = reviews.filter(r => r.menuId === menu.id);
  const averageRating = menuReviews.length > 0 
    ? (menuReviews.reduce((sum, r) => sum + r.rating, 0) / menuReviews.length).toFixed(1)
    : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === "unauthenticated") {
      onRequireAuth();
      return;
    }

    if (!rating) return;
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
    <div className="mt-4 border-t border-gray-100/10 pt-4">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-determination-red transition-colors w-full justify-between"
      >
        <div className="flex items-center gap-2">
          <Star size={16} className={averageRating > 0 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
          <span className="font-semibold">{averageRating > 0 ? averageRating : "Belum ada rating"}</span>
          <span className="text-xs">({menuReviews.length} Ulasan)</span>
        </div>
        <MessageSquare size={16} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 pb-2 flex flex-col gap-3">
              {menuReviews.length > 0 ? (
                <div className="max-h-40 overflow-y-auto pr-1 flex flex-col gap-2">
                  {menuReviews.map(r => (
                    <div key={r.id} className="bg-black/5 p-2 rounded-lg border border-white/10 text-xs">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold">{r.user?.name || "Pengguna"}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} className={i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                          ))}
                        </div>
                      </div>
                      {r.comment && <p className="text-gray-600 line-clamp-2">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-center text-gray-400 py-2">Jadilah yang pertama memberikan ulasan!</p>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2 bg-white/40 p-2 rounded-xl border border-white/20">
                <div className="flex gap-1 justify-center py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => {
                        if (status === "unauthenticated") {
                          onRequireAuth();
                        } else {
                          setRating(star);
                        }
                      }}
                      className="focus:outline-none"
                    >
                      <Star size={20} className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-200 transition-colors"} />
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tulis ulasan..."
                    className="flex-1 bg-white/50 border border-gray-200 rounded-lg px-3 text-xs focus:outline-none focus:border-determination-red/50"
                    value={comment}
                    onClick={() => {
                      if (status === "unauthenticated") onRequireAuth();
                    }}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <button 
                    type="submit" 
                    disabled={isSubmitting || status === "unauthenticated"} 
                    className="bg-determination-red text-white p-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
