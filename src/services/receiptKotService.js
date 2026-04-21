const { httpError } = require("../utils/httpError");
const { pool } = require("../config/db");

/**
 * Algoritma 1: Memecah data pesanan valid menjadi data struk (bill)
 * dan data kitchen order ticket (KOT).
 */
async function splitReceiptAndKotByOrderId(orderId) {
  const [orderRows] = await pool.execute(
    `SELECT o.id, o.transaction_code, o.table_number, o.customer_name, o.status,
            t.status AS payment_status, t.payment_method, t.sub_total, t.tax_amount, t.discount_amount, t.grand_total
     FROM orders o
     JOIN transactions t ON t.order_id = o.id
     WHERE o.id = ?`,
    [orderId]
  );

  if (!orderRows.length) {
    throw httpError("Order tidak ditemukan.", 404);
  }

  const [detailRows] = await pool.execute(
    `SELECT od.menu_id, m.menu_name, m.station, od.qty, od.price, od.note,
            (od.qty * od.price) AS line_total
     FROM order_details od
     JOIN menus m ON m.id = od.menu_id
     WHERE od.order_id = ?
     ORDER BY od.id ASC`,
    [orderId]
  );

  if (!detailRows.length) {
    throw httpError("Order detail kosong.", 400);
  }

  const order = orderRows[0];

  return {
    receipt: {
      summary: {
        transaction_code: order.transaction_code,
        table_number: order.table_number,
        customer_name: order.customer_name,
        order_status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        sub_total: Number(order.sub_total),
        ppn_amount: Number(order.tax_amount),
        discount_amount: Number(order.discount_amount),
        grand_total: Number(order.grand_total)
      },
      items: detailRows.map((row) => ({
        menu_id: row.menu_id,
        menu_name: row.menu_name,
        qty: Number(row.qty),
        price: Number(row.price),
        line_total: Number(row.line_total)
      }))
    },
    kot: {
      order_id: orderId,
      transaction_code: order.transaction_code,
      items: detailRows.map((row) => ({
        menu_name: row.menu_name,
        qty: Number(row.qty),
        note: row.note || "",
        station: row.station
      }))
    }
  };
}

module.exports = { splitReceiptAndKotByOrderId };
