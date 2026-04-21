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
    ewalletNumber: sanitize(payload?.ewalletNumber),
    bankAccount: sanitize(payload?.bankAccount),
    qrisImageUrl: sanitize(payload?.qrisImageUrl)
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
