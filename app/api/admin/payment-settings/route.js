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

  const bankRegex = /^[0-9\-\s]{8,20}$/;
  const ewalletRegex = /^08[0-9]{8,13}$/;

  const reqBank = String(body.bankAccount || "").trim();
  if (reqBank && !bankRegex.test(reqBank)) {
    return Response.json({ message: "Format Nomor Rekening tidak valid (hanya angka, strip, spasi, 8-20 digit)" }, { status: 400 });
  }

  const reqEwallet = String(body.ewalletNumber || "").trim();
  if (reqEwallet && !ewalletRegex.test(reqEwallet)) {
    return Response.json({ message: "Format E-Wallet tidak valid (harus diawali 08, 10-15 digit)" }, { status: 400 });
  }

  const reqQris = String(body.qrisImageUrl || "").trim();
  if (reqQris.startsWith("data:") && !reqQris.startsWith("data:image/")) {
    return Response.json({ message: "File QRIS harus berupa gambar" }, { status: 400 });
  }

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
