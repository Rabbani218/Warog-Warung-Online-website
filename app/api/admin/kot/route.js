import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
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

  return Response.json(queue);
}
