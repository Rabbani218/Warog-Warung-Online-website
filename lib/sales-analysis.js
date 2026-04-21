export function analyzeSalesRows(rows) {
  const trends = {};
  const menuAgg = {};

  for (const row of rows) {
    const soldAt = new Date(row.soldAt);
    const key = `${soldAt.getFullYear()}-${String(soldAt.getMonth() + 1).padStart(2, "0")}`;

    trends[key] = (trends[key] || 0) + Number(row.revenue || 0);

    if (!menuAgg[row.menuName]) {
      menuAgg[row.menuName] = { quantity: 0, revenue: 0 };
    }

    menuAgg[row.menuName].quantity += Number(row.quantity || 0);
    menuAgg[row.menuName].revenue += Number(row.revenue || 0);
  }

  const monthlyTrend = Object.entries(trends)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));

  const topMenus = Object.entries(menuAgg)
    .map(([menuName, value]) => ({ menuName, ...value }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    totalRows: rows.length,
    monthlyTrend,
    topMenus
  };
}
