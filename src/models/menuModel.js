const { pool } = require("../config/db");

async function getAvailableMenus() {
  const [rows] = await pool.execute(
    `SELECT id, menu_code, menu_name, price, station
     FROM menus
     WHERE is_available = 1
     ORDER BY menu_name ASC`
  );
  return rows;
}

module.exports = { getAvailableMenus };
