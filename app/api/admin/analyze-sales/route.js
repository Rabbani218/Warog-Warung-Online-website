import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultStore } from "@/lib/store";
import { analyzeSalesRows } from "@/lib/sales-analysis";

export const dynamic = "force-dynamic";

function normalizeRow(row) {
  const soldAt = row.soldAt || row.date || row.tanggal;
  const menuName = row.menuName || row.menu || row.nama_menu;
  const quantity = Number(row.quantity || row.qty || row.jumlah || 0);
  const revenue = Number(row.revenue || row.omzet || row.total || 0);

  if (!soldAt || !menuName || Number.isNaN(quantity) || Number.isNaN(revenue)) {
    return null;
  }

  return {
    soldAt: new Date(soldAt),
    menuName: String(menuName),
    quantity,
    revenue
  };
}

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const rows = Array.isArray(body.rows) ? body.rows : [];
  const normalized = rows.map(normalizeRow).filter(Boolean);

  if (!normalized.length) {
    return Response.json({ message: "Data penjualan kosong atau tidak valid." }, { status: 400 });
  }

  const store = await getDefaultStore();

  await prisma.salesHistory.createMany({
    data: normalized.map((row) => ({
      storeId: store.id,
      soldAt: row.soldAt,
      menuName: row.menuName,
      quantity: row.quantity,
      revenue: row.revenue,
      source: "EXCEL_IMPORT"
    }))
  });

  const summary = analyzeSalesRows(normalized);

  return Response.json({
    message: "Import berhasil diproses.",
    summary
  });
}
