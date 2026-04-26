import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MessageSquare, User, Clock, Bot } from "lucide-react";
import AdminHeader from "@/components/AdminHeader";

export const dynamic = "force-dynamic";

export default async function CustomerServicePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const messages = await prisma.chatMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="w-full min-h-screen">
      <AdminHeader 
        badge="Monitoring"
        title={<>Customer Service <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600">Chat</span></>}
        description="Pantau interaksi pelanggan dengan AI Assistant secara real-time untuk memastikan layanan terbaik."
        badgeColor="rose"
      />

      <section className="glass-panel p-6 md:p-10">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner">
            <MessageSquare size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Pesan Masuk Terbaru</h2>
            <p className="text-sm text-slate-500">Pantau interaksi pelanggan dengan AI Assistant secara real-time.</p>
          </div>
        </div>

        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
              <MessageSquare size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-medium">Belum ada pesan masuk.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {messages.map((msg) => (
                <div key={msg.id} className="p-6 bg-white/60 border border-slate-100 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-xl hover:shadow-slate-200/50">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${msg.role === 'USER' ? 'bg-slate-100 text-slate-500' : 'bg-rose-500 text-white'}`}>
                      {msg.role === 'USER' ? <User size={20} /> : <Bot size={20} />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-800 line-clamp-2">{msg.message}</p>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {new Date(msg.createdAt).toLocaleString("id-ID")}
                        </span>
                        <span>•</span>
                        <span className={msg.role === 'USER' ? 'text-blue-500' : 'text-rose-500'}>{msg.role}</span>
                      </div>
                    </div>
                  </div>
                  
                  {msg.userId && (
                    <div className="hidden md:block">
                      <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-tighter">
                        Verified User
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
