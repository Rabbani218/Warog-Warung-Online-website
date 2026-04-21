const { pool } = require("../config/db");

async function getOrderQueue() {
  const [rows] = await pool.execute(
    `SELECT id, transaction_code, table_number, customer_name, status, created_at
     FROM orders
     WHERE status IN ('PENDING', 'PROCESSING')
     ORDER BY created_at ASC`
  );

  return rows;
}

async function getOrdersForAdmin() {
  const [rows] = await pool.execute(
    `SELECT o.id, o.transaction_code, o.table_number, o.customer_name, o.status,
            t.status AS payment_status, t.grand_total, o.created_at
     FROM orders o
     LEFT JOIN transactions t ON t.order_id = o.id
     ORDER BY o.created_at DESC`
  );

  return rows;
}

module.exports = { getOrderQueue, getOrdersForAdmin };
