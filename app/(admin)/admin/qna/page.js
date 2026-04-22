import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MessageSquare, User, Package, Send, CheckCircle2, Clock } from "lucide-react";
import QnaReplyForm from "@/components/QnaReplyForm";

export const dynamic = "force-dynamic";

export default async function AdminQnaInboxPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const qnas = await prisma.qnA.findMany({
    include: {
      user: true,
      menu: true
    },
    orderBy: { createdAt: "desc" }
  });

  const pendingCount = qnas.filter(q => !q.answer).length;

  return (
    <main className="w-full max-w-6xl mx-auto space-y-8 pb-20">
      <header className="mb-10">
        <span className="badge mb-2">Customer Interaction</span>
        <h1 className="retro-heading text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="text-[#FF6B6B]" size={32} /> Central Inbox QnA
        </h1>
        <p className="text-slate-500 mt-2">Menanggapi pertanyaan pelanggan seputar menu Anda.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-panel p-6 bg-rose-50/50 border-rose-100">
          <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-1">Menunggu Balasan</p>
          <p className="text-4xl font-black text-rose-600">{pendingCount}</p>
        </div>
        <div className="glass-panel p-6 bg-slate-50 border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Diskusi</p>
          <p className="text-4xl font-black text-slate-800">{qnas.length}</p>
        </div>
      </div>

      <div className="space-y-6">
        {qnas.length === 0 ? (
          <div className="glass-panel p-20 text-center border-dashed">
            <MessageSquare className="mx-auto mb-4 text-slate-200" size={64} />
            <h3 className="text-lg font-bold text-slate-400">Belum ada pertanyaan masuk.</h3>
          </div>
        ) : (
          qnas.map((q) => (
            <div key={q.id} className={`glass-panel p-6 md:p-8 space-y-6 transition-all border-l-4 ${q.answer ? 'border-l-emerald-400 opacity-80' : 'border-l-rose-400 shadow-xl shadow-rose-50'}`}>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      {q.user?.name || "Pelanggan"} 
                      <span className="text-[10px] px-2 py-0.5 bg-slate-200 rounded-md text-slate-500 uppercase">Customer</span>
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Clock size={12} /> {new Date(q.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-2xl border border-slate-100 self-start">
                  <Package size={16} className="text-[#FF6B6B]" />
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Bertanya tentang</p>
                    <p className="text-xs font-bold text-slate-700">{q.menu?.name}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 italic text-slate-600 leading-relaxed relative">
                <span className="absolute -top-3 left-6 px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase">Pertanyaan</span>
                "{q.question}"
              </div>

              {q.answer ? (
                <div className="pl-12 space-y-2">
                  <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-emerald-800 leading-relaxed relative">
                    <span className="absolute -top-3 left-6 px-3 py-1 bg-white border border-emerald-100 rounded-full text-[10px] font-black text-emerald-500 uppercase">Jawaban Anda</span>
                    {q.answer}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold justify-end pr-4">
                    <CheckCircle2 size={12} /> Terjawab pada {new Date(q.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <QnaReplyForm qnaId={q.id} />
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
