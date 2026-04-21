import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emitKotUpdate } from "@/lib/kot-events";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const status = String(body.status || "").toUpperCase();

  if (!["NEW", "PROCESSING", "DONE"].includes(status)) {
    return Response.json({ message: "Status KOT tidak valid." }, { status: 400 });
  }

  const updated = await prisma.kOTicket.update({
    where: { id: params.id },
    data: {
      status,
      order: {
        update: {
          status: status === "DONE" ? "COMPLETED" : status === "PROCESSING" ? "PROCESSING" : "PENDING"
        }
      }
    },
    include: { order: true }
  });

  emitKotUpdate({
    type: "KOT_UPDATED",
    kotId: updated.id,
    orderCode: updated.order.orderCode,
    status: updated.status,
    createdAt: updated.createdAt
  });

  return Response.json(updated);
}
