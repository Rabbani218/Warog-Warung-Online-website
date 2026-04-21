"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emitKotUpdate } from "@/lib/kot-events";
import { revalidatePath } from "next/cache";

function normalizeDisplayStatus(value) {
  const status = String(value || "").toUpperCase();

  if (status === "NEW") {
    return "NEW";
  }

  if (status === "PROCESSING" || status === "COOKING") {
    return "COOKING";
  }

  if (status === "DONE" || status === "READY") {
    return "READY";
  }

  throw new Error("Status KDS tidak valid.");
}

function toDbStatus(displayStatus) {
  if (displayStatus === "NEW") {
    return "NEW";
  }

  if (displayStatus === "COOKING") {
    return "PROCESSING";
  }

  return "DONE";
}

function toOrderStatus(displayStatus) {
  if (displayStatus === "NEW") {
    return "PENDING";
  }

  if (displayStatus === "COOKING") {
    return "PROCESSING";
  }

  return "COMPLETED";
}

export async function updateKotStatusAction(ticketId, requestedStatus) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const displayStatus = normalizeDisplayStatus(requestedStatus);
  const dbStatus = toDbStatus(displayStatus);

  const updated = await prisma.kOTicket.update({
    where: { id: ticketId },
    data: {
      status: dbStatus,
      order: {
        update: {
          status: toOrderStatus(displayStatus)
        }
      }
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
    }
  });

  emitKotUpdate({
    type: "KOT_UPDATED",
    kotId: updated.id,
    orderCode: updated.order.orderCode,
    status: updated.status,
    createdAt: updated.createdAt
  });

  revalidatePath("/admin/kds");
  revalidatePath("/admin/dashboard");

  return {
    id: updated.id,
    status: displayStatus,
    order: updated.order,
    createdAt: updated.createdAt
  };
}
