"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultStore } from "@/lib/store";
import { revalidatePath } from "next/cache";

function sanitize(value) {
  const normalized = String(value || "").trim();
  return normalized ? normalized : null;
}

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

async function ensureAdminAndStore() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const store = await getDefaultStore();
  if (!store) {
    throw new Error("Store belum tersedia.");
  }

  return store;
}

export async function getPaymentSettingsAction() {
  const store = await ensureAdminAndStore();

  const existing = await prisma.paymentSettings.findUnique({
    where: { storeId: store.id }
  });

  return {
    ewalletNumber: existing?.ewalletNumber || "",
    bankAccount: existing?.bankAccount || "",
    qrisImageUrl: existing?.qrisImageUrl || ""
  };
}

export async function savePaymentSettingsAction(payload) {
  const store = await ensureAdminAndStore();

  const data = {
    ewalletNumber: validateEwalletNumber(payload?.ewalletNumber),
    bankAccount: validateBankAccount(payload?.bankAccount),
    qrisImageUrl: sanitizeQrisImageDataUrl(payload?.qrisImageUrl)
  };

  const saved = await prisma.paymentSettings.upsert({
    where: { storeId: store.id },
    update: data,
    create: {
      storeId: store.id,
      ...data
    }
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");

  return {
    ok: true,
    ewalletNumber: saved.ewalletNumber || "",
    bankAccount: saved.bankAccount || "",
    qrisImageUrl: saved.qrisImageUrl || ""
  };
}
