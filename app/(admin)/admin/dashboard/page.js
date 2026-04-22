import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultStore } from "@/lib/store";
import { calculateInventoryForecast } from "@/lib/inventory-forecast";
import ExcelUploader from "@/components/ExcelUploader";
import QrDownloadCard from "@/components/QrDownloadCard";
import AdminTopNav from "@/components/AdminTopNav";
import AdminAnalyticsCharts from "@/components/AdminAnalyticsCharts";

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
  const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7));

  const [
    todayOrders,
    monthRevenue,
    ingredients,
    kotQueue,
    inventoryForecast,
    monthPaidOrders,
    todayPendingOrders,
    todayProcessingOrders,
    recentOrders,
    topMenuSales,
    allOrdersLast7,
    allOrders,
    hourlyOrders
  ] = await Promise.all([
    prisma.order.count({
      where: {
        storeId: store.id,
        createdAt: { gte: dayStart }
      }
    }),
    prisma.order.aggregate({
      where: {
        storeId: store.id,
        status: "PAID",
        createdAt: { gte: monthStart }
      },
      _sum: { grandTotal: true }
    }),
    prisma.ingredient.findMany({
      where: { storeId: store.id },
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
    }),
    prisma.order.findMany({
      where: {
        storeId: store.id,
        status: "PAID",
        createdAt: { gte: sevenDaysAgo }
      },
      select: { createdAt: true, grandTotal: true }
    }),
    prisma.order.findMany({
      where: { storeId: store.id },
      select: { status: true }
    }),
    prisma.order.findMany({
      where: {
        storeId: store.id,
        createdAt: { gte: dayStart }
      },
      select: { createdAt: true }
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
        where: { id: { in: topMenuIds } },
        select: { id: true, name: true }
      })
    : [];

  const menuNameMap = menus.reduce((acc, menu) => {
    acc[menu.id] = menu.name;
    return acc;
  }, {});

  // Generate 7-day revenue trend
  const revenueTrendMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("id-ID", {
      weekday: "short",
      month: "2-digit",
      day: "2-digit"
    });
    revenueTrendMap[label] = 0;
  }
  allOrdersLast7.forEach((order) => {
    const d = new Date(order.createdAt);
    const label = d.toLocaleDateString("id-ID", {
      weekday: "short",
      month: "2-digit",
      day: "2-digit"
    });
    revenueTrendMap[label] = (revenueTrendMap[label] || 0) + Number(order.grandTotal);
  });
  const revenueTrend = Object.entries(revenueTrendMap).map(([label, revenue]) => ({
    label,
    revenue
  }));

  // Generate order status distribution
  const statusCounts = allOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});
  const orderStatus = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.charAt(0) + name.slice(1).toLowerCase(),
    value
  }));

  // Generate peak hours
  const hourlyMap = {};
  for (let h = 0; h < 24; h++) {
    hourlyMap[h] = 0;
  }
  hourlyOrders.forEach((order) => {
    const hour = new Date(order.createdAt).getHours();
    hourlyMap[hour] += 1;
  });
  const peakHours = Object.entries(hourlyMap).map(([h, orders]) => ({
    hour: `${String(h).padStart(2, "0")}:00`,
    orders
  }));

  // Top menus for chart
  const topMenus = topMenuSales.slice(0, 5).map((item) => ({
    name: menuNameMap[item.menuId] || "Unknown",
    qty: Number(item._sum.quantity || 0)
  }));

  return (
    <main className="w-full min-h-screen">
      <div className="w-full space-y-8">
        <header className="flex flex-col items-center text-center mb-12">
          <div className="mb-4 flex flex-col items-center">
            <span className="badge">Admin Portal</span>
            <h1 className="retro-heading mt-2 text-3xl md:text-4xl">
              {store.name}
            </h1>
          </div>
          <AdminTopNav currentPath="/admin/dashboard" />
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 justify-center">
          <article className="glass-card" style={{ padding: "1rem" }}>
            <p style={{ marginTop: 0, color: "#9ca3af" }}>Order Hari Ini</p>
            <h2 style={{ marginBottom: 0 }}>{todayOrders}</h2>
          </article>
          <article className="glass-card" style={{ padding: "1rem" }}>
            <p style={{ marginTop: 0, color: "#9ca3af" }}>Pendapatan Bulan Ini</p>
            <h2 style={{ marginBottom: 0 }}>Rp {monthRevenueValue.toLocaleString("id-ID")}</h2>
          </article>
          <article className="glass-card" style={{ padding: "1rem" }}>
            <p style={{ marginTop: 0, color: "#9ca3af" }}>Inventory Alert</p>
            <h2 style={{ marginBottom: 0 }}>{lowStock.length} bahan</h2>
          </article>
          <article className="glass-card" style={{ padding: "1rem" }}>
            <p style={{ marginTop: 0, color: "#9ca3af" }}>Rata-rata Nilai Order</p>
            <h2 style={{ marginBottom: 0 }}>Rp {Math.round(averageOrderValue).toLocaleString("id-ID")}</h2>
            <p style={{ marginBottom: 0, color: "#9ca3af" }}>{monthPaidOrders} order paid bulan ini</p>
          </article>
          <article className="glass-card" style={{ padding: "1rem" }}>
            <p style={{ marginTop: 0, color: "#9ca3af" }}>Status Operasional Hari Ini</p>
            <p style={{ marginBottom: "0.35rem" }}>
              Pending: <strong>{todayPendingOrders}</strong>
            </p>
            <p style={{ marginBottom: 0 }}>
              Processing: <strong>{todayProcessingOrders}</strong>
            </p>
          </article>
        </section>

        <AdminAnalyticsCharts
          revenueTrend={revenueTrend}
          topMenus={topMenus}
          orderStatus={orderStatus}
          peakHours={peakHours}
        />

        <div style={{ marginTop: "2rem" }} />

        <div className="w-full space-y-6">
          <ExcelUploader />
          <QrDownloadCard />
        </div>

        <section className="glass-card p-6">
          <h3 className="text-xl font-bold mb-4">Kitchen Order Ticket Queue</h3>
          {kotQueue.length === 0 && <p className="text-slate-500">Belum ada KOT baru.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kotQueue.map((ticket) => (
              <article key={ticket.id} className="glass-card" style={{ padding: "0.75rem" }}>
                <strong>{ticket.order.orderCode}</strong>
                <p style={{ margin: "0.2rem 0", color: "#9ca3af" }}>
                  Meja: {ticket.order.tableNumber || "-"}
                </p>
                <span className="badge">{ticket.status}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-card p-6">
          <h3 className="text-xl font-bold mb-2">Inventory Forecast</h3>
          <p className="text-slate-500 mb-6">
            Prediksi burn rate harian bahan baku berdasarkan tren order 7 hari terakhir.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventoryForecast.map((item) => (
              <article key={item.ingredientId} className="glass-card" style={{ padding: "0.8rem" }}>
                <strong>{item.ingredientName}</strong>
                <p style={{ margin: "0.3rem 0", color: "#9ca3af" }}>
                  Stock: {item.currentStock.toFixed(2)} {item.unit}
                </p>
                <p style={{ margin: "0.3rem 0", color: "#9ca3af" }}>
                  Burn rate: {item.burnRatePerDay.toFixed(2)} {item.unit}/hari
                </p>
                <span className="badge">{item.alertLevel}</span>
                <p
                  style={{
                    marginBottom: 0,
                    color: item.alertLevel === "CRITICAL" ? "#ef4444" : "#9ca3af"
                  }}
                >
                  {item.message}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-card p-6">
          <h3 className="text-xl font-bold mb-6">Top Menu Bulan Ini</h3>
          {topMenuSales.length === 0 && <p className="text-slate-500">Belum ada penjualan menu bulan ini.</p>}
          {topMenuSales.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {topMenuSales.map((item) => (
                <article key={item.menuId} className="glass-card" style={{ padding: "0.8rem" }}>
                  <strong>{menuNameMap[item.menuId] || "Menu Tidak Ditemukan"}</strong>
                  <p style={{ margin: "0.3rem 0", color: "#9ca3af" }}>
                    Qty terjual: {Number(item._sum.quantity || 0)}
                  </p>
                  <p style={{ margin: 0, color: "#9ca3af" }}>
                    Omzet: Rp {Number(item._sum.lineTotal || 0).toLocaleString("id-ID")}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="glass-card p-6">
          <h3 className="text-xl font-bold mb-6">Recent Orders</h3>
          {recentOrders.length === 0 && <p className="text-slate-500">Belum ada order masuk.</p>}
          {recentOrders.length > 0 && (
            <div className="overflow-x-auto">
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
                      <td>
                        <span className="badge">{order.status}</span>
                      </td>
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
      </div>
    </main>
  );
}
