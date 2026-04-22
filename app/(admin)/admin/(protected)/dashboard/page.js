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
import PrintReceiptWrapper from "@/components/PrintReceiptWrapper";
import { 
  TrendingUp, 
  ShoppingBag, 
  AlertTriangle, 
  DollarSign, 
  Activity,
  Package,
  Star,
  ChevronRight,
  ChefHat,
  Clock
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const store = await getDefaultStore();
  if (!store) {
    // ── LOOP FIX: render inline setup prompt instead of redirect("/setup") ──
    return (
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: "2rem" }}>
        <section className="panel hero-shell" style={{ maxWidth: 520, textAlign: "center", padding: "2.5rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#FF6B6B", marginBottom: "0.75rem" }}>
            Toko Belum Tersedia
          </h1>
          <p className="muted" style={{ marginBottom: "1.5rem" }}>
            Anda perlu membuat toko terlebih dahulu sebelum menggunakan dashboard.
          </p>
          <a href="/setup" className="btn" style={{ display: "inline-block", textDecoration: "none" }}>
            Buat Toko Sekarang
          </a>
        </section>
      </div>
    );
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
    prisma.order.count({ where: { storeId: store.id, createdAt: { gte: dayStart } } }),
    prisma.order.aggregate({
      where: { storeId: store.id, status: "PAID", createdAt: { gte: monthStart } },
      _sum: { grandTotal: true }
    }),
    prisma.ingredient.findMany({ where: { storeId: store.id }, orderBy: { updatedAt: "desc" } }),
    prisma.kOTicket.findMany({
      where: { order: { storeId: store.id }, status: { in: ["NEW", "PROCESSING"] } },
      include: { order: true },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    calculateInventoryForecast(store.id, 7),
    prisma.order.count({ where: { storeId: store.id, status: "PAID", createdAt: { gte: monthStart } } }),
    prisma.order.count({ where: { storeId: store.id, status: "PENDING", createdAt: { gte: dayStart } } }),
    prisma.order.count({ where: { storeId: store.id, status: "PROCESSING", createdAt: { gte: dayStart } } }),
    prisma.order.findMany({
      where: { storeId: store.id },
      include: { details: { include: { menu: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    prisma.orderDetail.groupBy({
      by: ["menuId"],
      where: { order: { storeId: store.id, createdAt: { gte: monthStart }, status: { in: ["PAID", "PROCESSING", "COMPLETED"] } } },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5
    }),
    prisma.order.findMany({
      where: { storeId: store.id, status: "PAID", createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, grandTotal: true }
    }),
    prisma.order.findMany({ where: { storeId: store.id }, select: { status: true } }),
    prisma.order.findMany({ where: { storeId: store.id, createdAt: { gte: dayStart } }, select: { createdAt: true } })
  ]);

  const lowStock = ingredients.filter(i => Number(i.stockQty) <= Number(i.minimumStock));
  const monthRevenueValue = Number(monthRevenue._sum.grandTotal || 0);
  const averageOrderValue = monthPaidOrders > 0 ? monthRevenueValue / monthPaidOrders : 0;

  const topMenuIds = topMenuSales.map(i => i.menuId);
  const menus = topMenuIds.length ? await prisma.menu.findMany({ where: { id: { in: topMenuIds } }, select: { id: true, name: true } }) : [];
  const menuNameMap = menus.reduce((acc, m) => ({ ...acc, [m.id]: m.name }), {});

  // Data processing for charts... (retaining logic from previous versions)
  const revenueTrendMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("id-ID", { weekday: "short", month: "2-digit", day: "2-digit" });
    revenueTrendMap[label] = 0;
  }
  allOrdersLast7.forEach(o => {
    const label = new Date(o.createdAt).toLocaleDateString("id-ID", { weekday: "short", month: "2-digit", day: "2-digit" });
    revenueTrendMap[label] = (revenueTrendMap[label] || 0) + Number(o.grandTotal);
  });
  const revenueTrend = Object.entries(revenueTrendMap).map(([label, revenue]) => ({ label, revenue }));

  const statusCounts = allOrders.reduce((acc, o) => ({ ...acc, [o.status]: (acc[o.status] || 0) + 1 }), {});
  const orderStatus = Object.entries(statusCounts).map(([name, value]) => ({ name: name.charAt(0) + name.slice(1).toLowerCase(), value }));

  const hourlyMap = Array.from({ length: 24 }, (_, i) => i).reduce((acc, h) => ({ ...acc, [h]: 0 }), {});
  hourlyOrders.forEach(o => { hourlyMap[new Date(o.createdAt).getHours()] += 1; });
  const peakHours = Object.entries(hourlyMap).map(([h, orders]) => ({ hour: `${String(h).padStart(2, "0")}:00`, orders }));

  const topMenus = topMenuSales.slice(0, 5).map(i => ({ name: menuNameMap[i.menuId] || "Unknown", qty: Number(i._sum.quantity || 0) }));

  const stats = [
    { label: "Orders Today", value: todayOrders, icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Revenue (Month)", value: `Rp ${monthRevenueValue.toLocaleString("id-ID")}`, icon: DollarSign, color: "text-[#FF6B6B]", bg: "bg-rose-50" },
    { label: "Avg. Order Value", value: `Rp ${Math.round(averageOrderValue).toLocaleString("id-ID")}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Low Stock Items", value: lowStock.length, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Activity Index", value: `${todayPendingOrders + todayProcessingOrders} Active`, icon: Activity, color: "text-indigo-500", bg: "bg-indigo-50" }
  ];

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <header className="flex flex-col items-center text-center space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-[#FF6B6B] text-[10px] font-bold uppercase tracking-widest">
            Control Center
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Dashboard <span className="text-gradient">Admin</span>
          </h1>
          <p className="text-slate-500 font-medium">Monitoring operasional harian {store.name}.</p>
        </div>
        <AdminTopNav currentPath="/admin/dashboard" />
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white/60 backdrop-blur-xl border border-white/40 p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 group hover:scale-[1.02] transition-all duration-300">
            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-6`}>
              <s.icon size={24} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
            <h2 className="text-xl font-black text-slate-900 leading-none">{s.value}</h2>
          </div>
        ))}
      </section>

      {/* Analytics Visualization */}
      <section className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-4 md:p-8 shadow-xl shadow-slate-200/30">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Visualisasi Analitik</h3>
        </div>
        <AdminAnalyticsCharts
          revenueTrend={revenueTrend}
          topMenus={topMenus}
          orderStatus={orderStatus}
          peakHours={peakHours}
        />
      </section>

      {/* Mid Section: Utility Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ExcelUploader />
        <QrDownloadCard />
      </div>

      {/* ── NEW VERTICAL FLUID LAYOUT (STACK) ── */}
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
        
        {/* 1. Inventory Management (Full Width) */}
        <InlineInventoryManager initialItems={inventoryForecast} />

        {/* 2. Live Top Products (Full Width & Horizontal Grid) */}
        <section className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/30">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Star size={24} className="text-amber-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Live: Menu Terlaris Saat Ini</h3>
                <p className="text-sm text-slate-500">Berdasarkan data penjualan bulan ini.</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {topMenuSales.map((item) => (
              <motion.div 
                key={item.menuId} 
                whileHover={{ scale: 1.05 }}
                className="flex flex-col p-5 bg-white/50 rounded-3xl border border-slate-100 shadow-sm hover:border-amber-200 transition-all"
              >
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Dish</span>
                <span className="font-bold text-slate-800 mb-2 truncate">{menuNameMap[item.menuId]}</span>
                <div className="flex justify-between items-end mt-auto">
                  <span className="text-xs font-bold text-emerald-500">{Number(item._sum.quantity || 0)} Porsi</span>
                  <p className="text-sm font-black text-[#FF6B6B]">Rp {Number(item._sum.lineTotal || 0).toLocaleString("id-ID")}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3. KDS Snapshot (Moved up for better visibility) */}
        <section className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/30">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <ChefHat size={24} className="text-indigo-600" />
              <h3 className="text-xl font-bold text-slate-900">Antrean Dapur (KDS)</h3>
            </div>
            <a href="/admin/kds" className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:underline">
              Kelola KDS <ChevronRight size={16} />
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kotQueue.map((ticket) => (
              <article key={ticket.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <strong className="text-lg font-black">{ticket.order.orderCode}</strong>
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 font-medium">Meja: {ticket.order.tableNumber || "-"}</p>
                <div className="pt-2 border-t border-slate-50 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <Clock size={12} />
                  {new Date(ticket.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </article>
            ))}
            {kotQueue.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 font-medium">
                Tidak ada antrean aktif saat ini.
              </div>
            )}
          </div>
        </section>

        {/* 4. Recent Orders Table (At the bottom, full width) */}
        <section className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/30">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 text-[#FF6B6B] rounded-xl flex items-center justify-center">
                <ShoppingBag size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Pesanan Terakhir</h3>
            </div>
          </div>
          
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="text-left py-4 px-2">Kode Order</th>
                  <th className="text-left py-4">Status</th>
                  <th className="text-left py-4">Meja</th>
                  <th className="text-right py-4">Total Pembayaran</th>
                  <th className="text-right py-4 pr-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-2 font-bold text-sm">{order.orderCode}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        order.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500 font-medium text-sm">{order.tableNumber || "-"}</td>
                    <td className="py-4 text-right font-black text-sm">Rp {Number(order.grandTotal).toLocaleString("id-ID")}</td>
                    <td className="py-4 text-right pr-2">
                      <PrintReceiptWrapper order={order} storeName={store.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
