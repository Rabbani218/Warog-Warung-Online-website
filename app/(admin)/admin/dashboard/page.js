import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultStore } from "@/lib/store";
import { calculateInventoryForecast } from "@/lib/inventory-forecast";
import ExcelUploader from "@/components/ExcelUploader";
import QrDownloadCard from "@/components/QrDownloadCard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const store = await getDefaultStore();
  if (!store) {
    redirect("/setup");
  }

  const dayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [todayOrders, monthRevenue, ingredients, kotQueue, inventoryForecast, monthPaidOrders, todayPendingOrders, todayProcessingOrders, recentOrders, topMenuSales] = await Promise.all([
    prisma.order.count({
      where: {
        storeId: store.id,
        createdAt: {
          gte: dayStart
        }
      }
    }),
    prisma.order.aggregate({
      where: {
        storeId: store.id,
        status: "PAID",
        createdAt: {
          gte: monthStart
        }
      },
      _sum: { grandTotal: true }
    }),
    prisma.ingredient.findMany({
      where: {
        storeId: store.id
      },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.kOTicket.findMany({
      where: { order: { storeId: store.id }, status: { in: ["NEW", "PROCESSING"] } },
      include: { order: true },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    calculateInventoryForecast(store.id, 7),
    prisma.order.count({
      where: {
        storeId: store.id,
        status: "PAID",
        createdAt: { gte: monthStart }
      }
    }),
    prisma.order.count({
      where: {
        storeId: store.id,
        status: "PENDING",
        createdAt: { gte: dayStart }
      }
    }),
    prisma.order.count({
      where: {
        storeId: store.id,
        status: "PROCESSING",
        createdAt: { gte: dayStart }
      }
    }),
    prisma.order.findMany({
      where: { storeId: store.id },
      select: {
        id: true,
        orderCode: true,
        status: true,
        tableNumber: true,
        grandTotal: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    prisma.orderDetail.groupBy({
      by: ["menuId"],
      where: {
        order: {
          storeId: store.id,
          createdAt: { gte: monthStart },
          status: { in: ["PAID", "PROCESSING", "COMPLETED"] }
        }
      },
      _sum: {
        quantity: true,
        lineTotal: true
      },
      orderBy: {
        _sum: {
          quantity: "desc"
        }
      },
      take: 5
    })
  ]);

  const lowStock = ingredients.filter(
    (ingredient) => Number(ingredient.stockQty) <= Number(ingredient.minimumStock)
  );

  const monthRevenueValue = Number(monthRevenue._sum.grandTotal || 0);
  const averageOrderValue = monthPaidOrders > 0 ? monthRevenueValue / monthPaidOrders : 0;

  const topMenuIds = topMenuSales.map((item) => item.menuId);
  const menus = topMenuIds.length
    ? await prisma.menu.findMany({
      where: {
        id: { in: topMenuIds }
      },
      select: {
        id: true,
        name: true
      }
    })
    : [];

  const menuNameMap = menus.reduce((acc, menu) => {
    acc[menu.id] = menu.name;
    return acc;
  }, {});

  return (
    <main className="container" style={{ padding: "1rem 0 2rem" }}>
      <header className="panel" style={{ padding: "1rem", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span className="badge">Admin Portal</span>
          <h1 style={{ margin: "0.35rem 0 0", fontFamily: '"Segoe Print", cursive' }}>{store.name}</h1>
        </div>
        <nav style={{ display: "flex", gap: "0.5rem" }}>
          <a className="btn" href="/admin/dashboard">Dashboard</a>
          <a className="btn" href="/admin/products">Products & Ads</a>
          <a className="btn" href="/admin/settings">Settings</a>
          <a className="btn" href="/admin/kds">KDS</a>
        </nav>
      </header>

      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", marginBottom: "1rem" }}>
        <article className="panel" style={{ padding: "1rem" }}>
          <p style={{ marginTop: 0, color: "#6b7280" }}>Order Hari Ini</p>
          <h2 style={{ marginBottom: 0 }}>{todayOrders}</h2>
        </article>
        <article className="panel" style={{ padding: "1rem" }}>
          <p style={{ marginTop: 0, color: "#6b7280" }}>Pendapatan Bulan Ini</p>
          <h2 style={{ marginBottom: 0 }}>Rp {monthRevenueValue.toLocaleString("id-ID")}</h2>
        </article>
        <article className="panel" style={{ padding: "1rem" }}>
          <p style={{ marginTop: 0, color: "#6b7280" }}>Inventory Alert</p>
          <h2 style={{ marginBottom: 0 }}>{lowStock.length} bahan</h2>
        </article>
        <article className="panel" style={{ padding: "1rem" }}>
          <p style={{ marginTop: 0, color: "#6b7280" }}>Rata-rata Nilai Order</p>
          <h2 style={{ marginBottom: 0 }}>Rp {Math.round(averageOrderValue).toLocaleString("id-ID")}</h2>
          <p style={{ marginBottom: 0, color: "#6b7280" }}>{monthPaidOrders} order paid bulan ini</p>
        </article>
        <article className="panel" style={{ padding: "1rem" }}>
          <p style={{ marginTop: 0, color: "#6b7280" }}>Status Operasional Hari Ini</p>
          <p style={{ marginBottom: "0.35rem" }}>Pending: <strong>{todayPendingOrders}</strong></p>
          <p style={{ marginBottom: 0 }}>Processing: <strong>{todayProcessingOrders}</strong></p>
        </article>
      </section>

      <ExcelUploader />
      <div style={{ height: 12 }} />
      <QrDownloadCard />

      <section className="panel" style={{ padding: "1rem", marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Kitchen Order Ticket Queue</h3>
        {kotQueue.length === 0 && <p>Belum ada KOT baru.</p>}
        <div className="grid">
          {kotQueue.map((ticket) => (
            <article key={ticket.id} className="panel" style={{ padding: "0.75rem" }}>
              <strong>{ticket.order.orderCode}</strong>
              <p style={{ margin: "0.2rem 0", color: "#6b7280" }}>Meja: {ticket.order.tableNumber || "-"}</p>
              <span className="badge">{ticket.status}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel" style={{ padding: "1rem", marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Inventory Forecast</h3>
        <p style={{ color: "#6b7280" }}>
          Prediksi burn rate harian bahan baku berdasarkan tren order 7 hari terakhir.
        </p>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
          {inventoryForecast.map((item) => (
            <article key={item.ingredientId} className="panel" style={{ padding: "0.8rem" }}>
              <strong>{item.ingredientName}</strong>
              <p style={{ margin: "0.3rem 0", color: "#6b7280" }}>
                Stock: {item.currentStock.toFixed(2)} {item.unit}
              </p>
              <p style={{ margin: "0.3rem 0", color: "#6b7280" }}>
                Burn rate: {item.burnRatePerDay.toFixed(2)} {item.unit}/hari
              </p>
              <span className="badge">{item.alertLevel}</span>
              <p style={{ marginBottom: 0, color: item.alertLevel === "CRITICAL" ? "#b91c1c" : "#374151" }}>
                {item.message}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel" style={{ padding: "1rem", marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Top Menu Bulan Ini</h3>
        {topMenuSales.length === 0 && <p style={{ marginBottom: 0 }}>Belum ada penjualan menu bulan ini.</p>}
        {topMenuSales.length > 0 && (
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
            {topMenuSales.map((item) => (
              <article key={item.menuId} className="panel" style={{ padding: "0.8rem" }}>
                <strong>{menuNameMap[item.menuId] || "Menu Tidak Ditemukan"}</strong>
                <p style={{ margin: "0.3rem 0", color: "#6b7280" }}>
                  Qty terjual: {Number(item._sum.quantity || 0)}
                </p>
                <p style={{ margin: 0, color: "#374151" }}>
                  Omzet: Rp {Number(item._sum.lineTotal || 0).toLocaleString("id-ID")}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel" style={{ padding: "1rem", marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Recent Orders</h3>
        {recentOrders.length === 0 && <p style={{ marginBottom: 0 }}>Belum ada order masuk.</p>}
        {recentOrders.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">Order Code</th>
                  <th align="left">Status</th>
                  <th align="left">Meja</th>
                  <th align="right">Total</th>
                  <th align="left">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.orderCode}</td>
                    <td><span className="badge">{order.status}</span></td>
                    <td>{order.tableNumber || "-"}</td>
                    <td align="right">Rp {Number(order.grandTotal).toLocaleString("id-ID")}</td>
                    <td>{new Date(order.createdAt).toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
