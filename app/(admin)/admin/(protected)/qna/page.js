import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MessageSquare, User, Bot, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import AdminHeader from "@/components/AdminHeader";

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
      <AdminHeader 
        badge="Customer Interaction"
        title={<>Central <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600">Inbox QnA</span></>}
        description="Riwayat interaksi pelanggan dengan Chatbot AI. Pantau semua pertanyaan masuk dan respon yang diberikan oleh asisten pintar."
        badgeColor="rose"
      />

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
      <div className="flex justify-center items-center gap-3 mt-12 pb-10">
        {/* Tombol Sebelumnya */}
        {currentPage === 1 ? (
          <span className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed font-bold text-sm">
            Sebelumnya
          </span>
        ) : (
          <Link 
            href={`?page=${currentPage - 1}`} 
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 transition-all font-bold text-sm"
          >
            Sebelumnya
          </Link>
        )}

        {/* Indikator Halaman */}
        <div className="px-4 py-2 rounded-lg bg-rose-50 text-rose-600 font-bold text-sm border border-rose-100">
          Halaman {currentPage} dari {totalPages || 1}
        </div>

        {/* Tombol Selanjutnya */}
        {currentPage >= totalPages ? (
          <span className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed font-bold text-sm">
            Selanjutnya
          </span>
        ) : (
          <Link 
            href={`?page=${currentPage + 1}`} 
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 transition-all font-bold text-sm"
          >
            Selanjutnya
          </Link>
        )}
      </div>
    </main>
  );
}
