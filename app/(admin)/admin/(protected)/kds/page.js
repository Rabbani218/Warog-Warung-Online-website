import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultStore } from "@/lib/store";
import AdminHeader from "@/components/AdminHeader";
import KdsRealtimeBoard from "@/components/KdsRealtimeBoard";

export const dynamic = "force-dynamic";

export default async function KdsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const store = await getDefaultStore();

  const queue = await prisma.kOTicket.findMany({
    where: {
      order: { storeId: store.id },
      status: { in: ["NEW", "PROCESSING", "DONE", "COOKING", "READY"] }
    },
    include: {
      order: {
        include: {
          details: {
            include: {
              menu: true
            }
          },
          invoice: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return (
    <main className="admin-shell" style={{ padding: "2rem 1rem" }}>
      <div className="w-full max-w-7xl mx-auto">
        <AdminHeader 
          badge="KDS System"
          title={<>Kitchen Queue <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600">Live</span></>}
          description="Monitor pesanan yang masuk dan sedang diproses secara real-time untuk efisiensi operasional dapur."
          badgeColor="emerald"
        />

        <KdsRealtimeBoard initialQueue={queue} />
      </div>
    </main>
  );
}
