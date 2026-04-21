const { pool } = require("../config/db");
const { httpError } = require("../utils/httpError");
const { orderEvents } = require("../utils/orderEvents");
const { deductStockForPaidOrder } = require("./orderService");

async function markTransactionPaid(orderId, payload) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [transactionRows] = await connection.execute(
      `SELECT id, status, grand_total
       FROM transactions
       WHERE order_id = ?
       FOR UPDATE`,
      [orderId]
    );

    if (!transactionRows.length) {
      throw httpError("Transaksi untuk order ini tidak ditemukan.", 404);
    }

    const transaction = transactionRows[0];
    if (transaction.status === "PAID") {
      throw httpError("Transaksi sudah dibayar.", 409);
    }

    await deductStockForPaidOrder(connection, orderId, payload.paid_by || null);

    await connection.execute(
      `UPDATE transactions
       SET status = 'PAID', payment_method = ?, paid_amount = ?, paid_at = NOW(), paid_by = ?
       WHERE order_id = ?`,
      [payload.payment_method, Number(transaction.grand_total), payload.paid_by || null, orderId]
    );

    await connection.execute(
      `UPDATE orders
       SET status = 'PROCESSING'
       WHERE id = ?`,
      [orderId]
    );

    await connection.commit();

    orderEvents.emit("order-updated", { order_id: orderId, status: "PROCESSING", payment_status: "PAID" });

    return {
      order_id: orderId,
      payment_status: "PAID",
      order_status: "PROCESSING"
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { markTransactionPaid };
