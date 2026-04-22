"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, Send, User, MessageCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitReviewAction, askQuestionAction } from "@/lib/ecommerceActions";

export default function ProductTabs({ menuId, reviews = [], qnas = [], session }) {
  const [activeTab, setActiveTab] = useState("reviews");
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [question, setQuestion] = useState("");

  const handleReview = async (e) => {
    e.preventDefault();
    if (!session) return toast.error("Silakan login untuk memberikan ulasan.");
    setLoading(true);
    const res = await submitReviewAction({ menuId, rating, comment });
    if (res.success) {
      toast.success("Ulasan berhasil dikirim!");
      setComment("");
    } else toast.error(res.message);
    setLoading(false);
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!session) return toast.error("Silakan login untuk bertanya.");
    setLoading(true);
    const res = await askQuestionAction({ menuId, question });
    if (res.success) {
      toast.success("Pertanyaan terkirim!");
      setQuestion("");
    } else toast.error(res.message);
    setLoading(false);
  };

  return (
    <div className="mt-16">
      <div className="flex gap-8 border-b border-slate-100 mb-8 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab("reviews")}
          className={`pb-4 text-sm font-bold transition-all relative ${activeTab === "reviews" ? "text-[#FF6B6B]" : "text-slate-400"}`}
        >
          Ulasan Pelanggan ({reviews.length})
          {activeTab === "reviews" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B6B]" />}
        </button>
        <button 
          onClick={() => setActiveTab("qna")}
          className={`pb-4 text-sm font-bold transition-all relative ${activeTab === "qna" ? "text-[#FF6B6B]" : "text-slate-400"}`}
        >
          Diskusi ({qnas.length})
          {activeTab === "qna" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B6B]" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "reviews" ? (
          <motion.div 
            key="reviews"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-12"
          >
            <div className="lg:col-span-2 space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <Star className="mx-auto mb-4 text-slate-300" size={32} />
                  <p className="text-slate-400 font-medium">Belum ada ulasan untuk produk ini.</p>
                </div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="glass-panel p-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{r.user?.name || "Anonim"}</p>
                          <div className="flex gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{r.comment}</p>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-6">
              <section className="glass-panel p-6 md:p-8 bg-rose-50/30 border-rose-100">
                <h3 className="font-bold text-slate-800 mb-4">Tulis Ulasan</h3>
                <form onSubmit={handleReview} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`transition-all ${rating >= star ? "text-amber-400 scale-110" : "text-slate-300 hover:text-amber-200"}`}
                        >
                          <Star size={24} fill={rating >= star ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea 
                    className="glass-input text-sm min-h-[100px]"
                    placeholder="Apa pendapat Anda tentang menu ini?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                  <button 
                    disabled={loading}
                    className="w-full py-3 bg-[#FF6B6B] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#ff5252] transition-all shadow-lg shadow-rose-100"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    Kirim Ulasan
                  </button>
                </form>
              </section>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="qna"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-12"
          >
            <div className="lg:col-span-2 space-y-8">
              {qnas.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <MessageSquare className="mx-auto mb-4 text-slate-300" size={32} />
                  <p className="text-slate-400 font-medium">Belum ada diskusi untuk produk ini.</p>
                </div>
              ) : (
                qnas.map((q) => (
                  <div key={q.id} className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        <User size={16} />
                      </div>
                      <div className="bg-slate-100/50 p-4 rounded-2xl rounded-tl-none border border-slate-200/50 flex-1">
                        <p className="text-xs font-bold text-slate-700 mb-1">{q.user?.name || "Pembeli"}</p>
                        <p className="text-sm text-slate-600">{q.question}</p>
                        <p className="text-[10px] text-slate-400 mt-2">{new Date(q.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {q.answer && (
                      <div className="flex gap-4 items-start pl-12">
                        <div className="bg-rose-50 p-4 rounded-2xl rounded-tr-none border border-rose-100 flex-1">
                          <p className="text-xs font-bold text-[#FF6B6B] mb-1">Penjual (Admin)</p>
                          <p className="text-sm text-slate-700 leading-relaxed">{q.answer}</p>
                        </div>
                        <div className="w-8 h-8 shrink-0 rounded-xl bg-rose-100 flex items-center justify-center text-[#FF6B6B]">
                          <MessageCircle size={16} />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="space-y-6">
              <section className="glass-panel p-6 md:p-8 bg-slate-50/50 border-slate-200">
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <MessageSquare size={18} className="text-[#FF6B6B]" /> Tanya Penjual
                </h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Punya pertanyaan seputar komposisi atau rasa? Tanyakan langsung di sini.
                </p>
                <form onSubmit={handleAsk} className="space-y-4">
                  <textarea 
                    className="glass-input text-sm min-h-[100px]"
                    placeholder="Ketik pertanyaan Anda..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                  />
                  <button 
                    disabled={loading}
                    className="w-full py-3 bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-xl shadow-slate-200"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    Tanya Sekarang
                  </button>
                  {!session && (
                    <div className="flex items-center gap-2 text-[10px] text-rose-500 font-bold bg-rose-50 p-3 rounded-xl border border-rose-100">
                      <AlertCircle size={14} /> Wajib Login untuk bertanya
                    </div>
                  )}
                </form>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
