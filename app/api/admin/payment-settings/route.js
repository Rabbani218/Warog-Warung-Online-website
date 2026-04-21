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
  return Response.json({
    bankAccountNumber: store.bankAccountNumber,
    paymentGatewayKey: store.paymentGatewayKey
  });
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const store = await getDefaultStore();

  const updated = await prisma.store.update({
    where: { id: store.id },
    data: {
      bankAccountNumber: body.bankAccountNumber || null,
      paymentGatewayKey: body.paymentGatewayKey || null
    }
  });

  return Response.json({
    bankAccountNumber: updated.bankAccountNumber,
    paymentGatewayKey: updated.paymentGatewayKey
  });
}
