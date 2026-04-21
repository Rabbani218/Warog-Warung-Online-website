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
  const payment = await prisma.paymentSettings.findUnique({
    where: { storeId: store.id }
  });

  return Response.json({
    ewalletNumber: payment?.ewalletNumber || "",
    bankAccount: payment?.bankAccount || "",
    qrisImageUrl: payment?.qrisImageUrl || ""
  });
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const store = await getDefaultStore();

  const updated = await prisma.paymentSettings.upsert({
    where: { storeId: store.id },
    update: {
      ewalletNumber: String(body.ewalletNumber || "").trim() || null,
      bankAccount: String(body.bankAccount || "").trim() || null,
      qrisImageUrl: String(body.qrisImageUrl || "").trim() || null
    },
    create: {
      storeId: store.id,
      ewalletNumber: String(body.ewalletNumber || "").trim() || null,
      bankAccount: String(body.bankAccount || "").trim() || null,
      qrisImageUrl: String(body.qrisImageUrl || "").trim() || null
    }
  });

  return Response.json({
    ewalletNumber: updated.ewalletNumber || "",
    bankAccount: updated.bankAccount || "",
    qrisImageUrl: updated.qrisImageUrl || ""
  });
}
