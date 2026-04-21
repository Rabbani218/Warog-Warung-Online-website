const { pool } = require("../config/db");
const { httpError } = require("../utils/httpError");
const { orderEvents } = require("../utils/orderEvents");

function generateTransactionCode() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `TRX-${y}${m}${d}-${rand}`;
}

/**
 * Membuat order secara atomik tanpa memotong stok.
 * Stok bahan baku akan divalidasi dan dikurangi saat transaksi berubah menjadi PAID.
 */
async function createOrderWithAtomicStockDeduction(payload) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const menuIds = [...new Set(payload.items.map((item) => Number(item.menu_id)))];
    const placeholders = menuIds.map(() => "?").join(",");

    const [menuRows] = await connection.execute(
      `SELECT id, menu_name, price, station, is_available
       FROM menus
       WHERE id IN (${placeholders})
       FOR UPDATE`,
      menuIds
    );

    const menuMap = new Map(menuRows.map((row) => [row.id, row]));

    for (const item of payload.items) {
      const menu = menuMap.get(Number(item.menu_id));
      if (!menu || Number(menu.is_available) !== 1) {
        throw httpError(`Menu ID ${item.menu_id} tidak tersedia.`, 400);
      }
    }

    const [recipeRows] = await connection.execute(
      `SELECT menu_id, ingredient_id, qty_needed
       FROM recipes
       WHERE menu_id IN (${placeholders})`,
      menuIds
    );

    if (!recipeRows.length) {
      throw httpError("Data BOM tidak ditemukan untuk menu yang dipesan.", 400);
    }

    for (const item of payload.items) {
      const menuId = Number(item.menu_id);
      const recipeForMenu = recipeRows.filter((row) => Number(row.menu_id) === menuId);

      if (!recipeForMenu.length) {
        throw httpError(`BOM untuk menu ID ${menuId} belum diset.`, 400);
      }
    }

    const transactionCode = generateTransactionCode();
    const [orderInsert] = await connection.execute(
      `INSERT INTO orders (transaction_code, table_number, customer_name, created_by, status, sub_total)
       VALUES (?, ?, ?, ?, 'PENDING', 0)`,
      [transactionCode, payload.table_number, payload.customer_name || null, payload.created_by || null]
    );

    const orderId = Number(orderInsert.insertId);

    let subTotal = 0;
    for (const item of payload.items) {
      const menu = menuMap.get(Number(item.menu_id));
      const qty = Number(item.qty);
      const lineTotal = Number(menu.price) * qty;
      subTotal += lineTotal;

      await connection.execute(
        `INSERT INTO order_details (order_id, menu_id, qty, price, note)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, Number(item.menu_id), qty, Number(menu.price), item.note || null]
      );
    }

    const taxPercent = Number(payload.tax_percent || 0);
    const discountAmount = Number(payload.discount_amount || 0);
    const taxAmount = (subTotal * taxPercent) / 100;
    const grandTotal = subTotal + taxAmount - discountAmount;

    await connection.execute(
      `UPDATE orders
       SET sub_total = ?
       WHERE id = ?`,
      [subTotal, orderId]
    );

    await connection.execute(
      `INSERT INTO transactions
       (order_id, status, payment_method, sub_total, tax_amount, discount_amount, grand_total)
       VALUES (?, 'UNPAID', NULL, ?, ?, ?, ?)`,
      [orderId, subTotal, taxAmount, discountAmount, grandTotal]
    );

    await connection.commit();

    const eventPayload = {
      order_id: orderId,
      transaction_code: transactionCode,
      status: "PENDING"
    };
    orderEvents.emit("order-updated", eventPayload);

    return {
      order_id: orderId,
      transaction_code: transactionCode,
      status: "PENDING",
      sub_total: subTotal,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      grand_total: grandTotal
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateOrderStatus(orderId, status) {
  await pool.execute(
    `UPDATE orders
     SET status = ?
     WHERE id = ?`,
    [status, orderId]
  );

  orderEvents.emit("order-updated", { order_id: orderId, status });

  return { order_id: orderId, status };
}

async function deductStockForPaidOrder(connection, orderId, createdBy = null) {
  const [detailRows] = await connection.execute(
    `SELECT od.menu_id, od.qty, m.menu_name
     FROM order_details od
     JOIN menus m ON m.id = od.menu_id
     WHERE od.order_id = ?`,
    [orderId]
  );

  if (!detailRows.length) {
    throw httpError("Detail order tidak ditemukan.", 400);
  }

  const menuIds = [...new Set(detailRows.map((row) => Number(row.menu_id)))];
  const placeholders = menuIds.map(() => "?").join(",");

  const [recipeRows] = await connection.execute(
    `SELECT menu_id, ingredient_id, qty_needed
     FROM recipes
     WHERE menu_id IN (${placeholders})`,
    menuIds
  );

  if (!recipeRows.length) {
    throw httpError("Data BOM tidak ditemukan untuk menu yang dipesan.", 400);
  }

  const requiredByIngredient = new Map();

  for (const detail of detailRows) {
    const recipeForMenu = recipeRows.filter((row) => Number(row.menu_id) === Number(detail.menu_id));

    if (!recipeForMenu.length) {
      throw httpError(`BOM untuk menu ID ${detail.menu_id} belum diset.`, 400);
    }

    for (const row of recipeForMenu) {
      const ingredientId = Number(row.ingredient_id);
      const neededQty = Number(row.qty_needed) * Number(detail.qty);
      requiredByIngredient.set(ingredientId, (requiredByIngredient.get(ingredientId) || 0) + neededQty);
    }
  }

  const ingredientIds = [...requiredByIngredient.keys()];
  const ingredientPlaceholders = ingredientIds.map(() => "?").join(",");

  const [ingredientRows] = await connection.execute(
    `SELECT id, ingredient_name, stock_qty
     FROM ingredients
     WHERE id IN (${ingredientPlaceholders})
     FOR UPDATE`,
    ingredientIds
  );

  const ingredientMap = new Map(ingredientRows.map((row) => [Number(row.id), row]));

  for (const [ingredientId, neededQty] of requiredByIngredient.entries()) {
    const ingredient = ingredientMap.get(ingredientId);

    if (!ingredient) {
      throw httpError(`Ingredient ID ${ingredientId} tidak ditemukan.`, 404);
    }

    if (Number(ingredient.stock_qty) < neededQty) {
      throw httpError(`Bahan baku ${ingredient.ingredient_name} habis`, 409);
    }
  }

  for (const [ingredientId, neededQty] of requiredByIngredient.entries()) {
    await connection.execute(
      `UPDATE ingredients
       SET stock_qty = stock_qty - ?
       WHERE id = ?`,
      [neededQty, ingredientId]
    );

    await connection.execute(
      `INSERT INTO stock_movements
       (ingredient_id, movement_type, qty, reference_order_id, note, created_by)
       VALUES (?, 'OUT', ?, ?, 'Auto deduction when payment turns PAID', ?)`,
      [ingredientId, neededQty, orderId, createdBy]
    );
  }

  return { order_id: orderId, deducted: true };
}

module.exports = {
  createOrderWithAtomicStockDeduction,
  deductStockForPaidOrder,
  updateOrderStatus
};
