import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MessageSquare, User, Bot, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminQnaInboxPage({ searchParams }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  // ▸ Task 3: Pagination Logic
  const currentPage = parseInt(searchParams?.page || "1");
  const pageSize = 10;
  const skip = (currentPage - 1) * pageSize;

  const [chats, totalChats] = await Promise.all([
    prisma.chatLog.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" }
    }),
    prisma.chatLog.count()
  ]);

  const totalPages = Math.ceil(totalChats / pageSize);

  return (
    <main className="w-full max-w-6xl mx-auto space-y-8 pb-20">
      <header className="mb-10">
        <span className="badge mb-2">Customer Interaction</span>
        <h1 className="retro-heading text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="text-[#FF6B6B]" size={32} /> Central Inbox QnA
        </h1>
        <p className="text-slate-500 mt-2">Riwayat interaksi pelanggan dengan Chatbot AI.</p>
      </header>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-panel p-6 bg-rose-50/50 border-rose-100">
          <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-1">Total Diskusi</p>
          <p className="text-4xl font-black text-rose-600">{totalChats}</p>
        </div>
        <div className="glass-panel p-6 bg-slate-50 border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Halaman</p>
          <p className="text-4xl font-black text-slate-800">{currentPage} <span className="text-lg text-slate-400">/ {totalPages || 1}</span></p>
        </div>
      </div>

      {/* Chat List */}
      <div className="space-y-6">
        {chats.length === 0 ? (
          <div className="glass-panel p-20 text-center border-dashed">
            <MessageSquare className="mx-auto mb-4 text-slate-200" size={64} />
            <h3 className="text-lg font-bold text-slate-400">Belum ada riwayat obrolan masuk.</h3>
          </div>
        ) : (
          chats.map((chat) => (
            <div key={chat.id} className="glass-panel p-6 md:p-8 space-y-6 transition-all hover:shadow-xl hover:shadow-slate-100 border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Pelanggan Anonymous</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                      <Clock size={10} /> {new Date(chat.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-1 bg-slate-100 rounded-md text-slate-500 font-bold uppercase tracking-wider">AI Interaction</span>
              </div>

              <div className="space-y-4">
                {/* User Message */}
                <div className="flex gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 text-slate-700 text-sm leading-relaxed flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Pertanyaan</p>
                    {chat.userMessage}
                  </div>
                </div>

                {/* Bot Reply */}
                <div className="flex gap-4 flex-row-reverse">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-2xl rounded-tr-none border border-emerald-100 text-emerald-900 text-sm leading-relaxed flex-1">
                    <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">AI Response</p>
                    {chat.botReply}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ▸ Task 4: Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-12">
          <Link
            href={`?page=${currentPage - 1}`}
            className={`flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all ${currentPage <= 1 ? "pointer-events-none opacity-50" : ""}`}
          >
            <ChevronLeft size={20} /> Sebelumnya
          </Link>

          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1;
              // Show limited page numbers if there are too many
              if (totalPages > 5 && Math.abs(p - currentPage) > 2) return null;
              return (
                <Link
                  key={p}
                  href={`?page=${p}`}
                  className={`w-12 h-12 flex items-center justify-center rounded-2xl font-bold transition-all ${currentPage === p ? "bg-[#FF6B6B] text-white shadow-lg shadow-rose-200" : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50"}`}
                >
                  {p}
                </Link>
              );
            })}
          </div>

          <Link
            href={`?page=${currentPage + 1}`}
            className={`flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all ${currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}`}
          >
            Selanjutnya <ChevronRight size={20} />
          </Link>
        </div>
      )}
    </main>
  );
}
