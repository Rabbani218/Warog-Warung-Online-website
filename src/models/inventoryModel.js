const { pool } = require("../config/db");

async function getInventoryList() {
  const [rows] = await pool.execute(
    `SELECT id, ingredient_code, ingredient_name, unit, stock_qty, minimum_stock
     FROM ingredients
     ORDER BY ingredient_name ASC`
  );

  return rows;
}

module.exports = { getInventoryList };
