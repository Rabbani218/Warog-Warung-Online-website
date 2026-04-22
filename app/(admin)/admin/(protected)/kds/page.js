import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultStore } from "@/lib/store";
import AdminTopNav from "@/components/AdminTopNav";
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
        <header style={{ marginBottom: "2rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <span className="badge">KDS System</span>
            <h1 className="retro-heading" style={{ margin: "0.5rem 0 0", fontSize: "1.8rem" }}>
              Kitchen Queue Live
            </h1>
          </div>
          <AdminTopNav currentPath="/admin/kds" />
        </header>

        <KdsRealtimeBoard initialQueue={queue} />
      </div>
    </main>
  );
}
