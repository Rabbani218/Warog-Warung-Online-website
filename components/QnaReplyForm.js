"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { replyQuestionAction } from "@/lib/ecommerceActions";

export default function QnaReplyForm({ qnaId }) {
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  const handleReply = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    
    setLoading(true);
    const res = await replyQuestionAction({ qnaId, answer });
    if (res.success) {
      toast.success("Jawaban terkirim!");
      setAnswer("");
    } else toast.error(res.message);
    setLoading(false);
  };

  return (
    <form onSubmit={handleReply} className="pl-12 space-y-4">
      <div className="relative">
        <textarea 
          className="glass-input text-sm min-h-[100px] border-rose-100 bg-rose-50/20 focus:bg-white transition-all"
          placeholder="Ketik jawaban Anda di sini..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
        />
        <button 
          disabled={loading}
          className="absolute bottom-4 right-4 p-3 bg-slate-800 text-white rounded-2xl shadow-xl hover:bg-slate-900 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        </button>
      </div>
      <p className="text-[10px] text-slate-400 font-medium italic pl-2">
        * Jawaban akan tampil secara publik di halaman produk.
      </p>
    </form>
  );
}
