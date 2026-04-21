const { pool } = require("../config/db");

async function getDashboardMetrics() {
  const [dailyRows] = await pool.execute(
    `SELECT DATE(t.paid_at) AS period, COALESCE(SUM(t.grand_total), 0) AS revenue, COUNT(*) AS orders_count
     FROM transactions t
     WHERE t.status = 'PAID'
       AND t.paid_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY DATE(t.paid_at)
     ORDER BY period ASC`
  );

  const [monthlyRows] = await pool.execute(
    `SELECT DATE_FORMAT(t.paid_at, '%Y-%m') AS period, COALESCE(SUM(t.grand_total), 0) AS revenue, COUNT(*) AS orders_count
     FROM transactions t
     WHERE t.status = 'PAID'
       AND t.paid_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
     GROUP BY DATE_FORMAT(t.paid_at, '%Y-%m')
     ORDER BY period ASC`
  );

  const [alertRows] = await pool.execute(
    `SELECT ingredient_code, ingredient_name, unit, stock_qty, minimum_stock
     FROM ingredients
     WHERE stock_qty <= minimum_stock
     ORDER BY (minimum_stock - stock_qty) DESC, ingredient_name ASC`
  );

  return {
    daily: dailyRows,
    monthly: monthlyRows,
    alerts: alertRows
  };
}

async function getRecipeCatalog() {
  const [rows] = await pool.execute(
    `SELECT r.id, m.menu_code, m.menu_name, i.ingredient_code, i.ingredient_name, i.unit, r.qty_needed
     FROM recipes r
     JOIN menus m ON m.id = r.menu_id
     JOIN ingredients i ON i.id = r.ingredient_id
     ORDER BY m.menu_name ASC, i.ingredient_name ASC`
  );

  return rows;
}

module.exports = {
  getDashboardMetrics,
  getRecipeCatalog
};