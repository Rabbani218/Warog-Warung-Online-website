import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultStore } from "@/lib/store";

export const dynamic = "force-dynamic";

function validateEwalletNumber(value) {
  const cleaned = String(value || "").replace(/[^\d+]/g, "");
  if (!cleaned) {
    return null;
  }

  const normalized = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;
  if (!/^\d{8,16}$/.test(normalized)) {
    throw new Error("Nomor e-wallet harus 8-16 digit angka.");
  }

  return cleaned;
}

function validateBankAccount(value) {
  const cleaned = String(value || "").replace(/[^0-9A-Za-z\s.\-\/]/g, "").trim();
  if (!cleaned) {
    return null;
  }

  const digitCount = cleaned.replace(/\D/g, "").length;
  if (digitCount < 6 || digitCount > 30) {
    throw new Error("Nomor rekening tidak valid. Minimal 6 dan maksimal 30 digit.");
  }

  return cleaned;
}

function sanitizeQrisImageDataUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return null;
  }

  const match = raw.match(/^data:(image\/(png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)$/i);
  if (!match) {
    throw new Error("QRIS harus berupa data URL gambar PNG/JPEG/WEBP.");
  }

  const base64Payload = match[3];
  const bytes = Buffer.byteLength(base64Payload, "base64");
  if (bytes > 3 * 1024 * 1024) {
    throw new Error("Ukuran QRIS maksimal 3MB.");
  }

  return `data:${match[1].toLowerCase()};base64,${base64Payload}`;
}

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

  let validated;
  try {
    validated = {
      ewalletNumber: validateEwalletNumber(body.ewalletNumber),
      bankAccount: validateBankAccount(body.bankAccount),
      qrisImageUrl: sanitizeQrisImageDataUrl(body.qrisImageUrl)
    };
  } catch (error) {
    return Response.json({ message: error.message || "Data pembayaran tidak valid." }, { status: 400 });
  }

  const store = await getDefaultStore();

  const updated = await prisma.paymentSettings.upsert({
    where: { storeId: store.id },
    update: {
      ewalletNumber: validated.ewalletNumber,
      bankAccount: validated.bankAccount,
      qrisImageUrl: validated.qrisImageUrl
    },
    create: {
      storeId: store.id,
      ewalletNumber: validated.ewalletNumber,
      bankAccount: validated.bankAccount,
      qrisImageUrl: validated.qrisImageUrl
    }
  });

  return Response.json({
    ewalletNumber: updated.ewalletNumber || "",
    bankAccount: updated.bankAccount || "",
    qrisImageUrl: updated.qrisImageUrl || ""
  });
}
