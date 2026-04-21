const { pool } = require("../../src/config/db");
const { buildPasswordHash } = require("../../src/services/authService");

async function run() {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const users = [
      ["Admin Wareb", "admin@wareb.local", buildPasswordHash("admin12345"), "ADMIN"],
      ["Kasir Wareb", "cashier@wareb.local", buildPasswordHash("cashier12345"), "CASHIER"],
      ["Dapur Wareb", "kitchen@wareb.local", buildPasswordHash("kitchen12345"), "KITCHEN"]
    ];

    for (const user of users) {
      await connection.execute(
        `INSERT INTO users (full_name, email, password_hash, role, is_active)
         VALUES (?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password_hash = VALUES(password_hash), role = VALUES(role), is_active = 1`,
        user
      );
    }

    const menus = [
      ["MNU-001", "Nasi Goreng Spesial", 18000, 1, "KITCHEN"],
      ["MNU-002", "Mie Tek-Tek", 16000, 1, "KITCHEN"],
      ["MNU-003", "Es Teh Manis", 5000, 1, "BAR"],
      ["MNU-004", "Ayam Goreng Bumbu", 22000, 1, "KITCHEN"]
    ];

    for (const menu of menus) {
      await connection.execute(
        `INSERT INTO menus (menu_code, menu_name, price, is_available, station)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE menu_name = VALUES(menu_name), price = VALUES(price), is_available = VALUES(is_available), station = VALUES(station)`,
        menu
      );
    }

    const ingredients = [
      ["ING-001", "Beras", "gram", 25000, 4000],
      ["ING-002", "Mie", "gram", 12000, 2000],
      ["ING-003", "Telur", "butir", 120, 20],
      ["ING-004", "Ayam", "gram", 18000, 3000],
      ["ING-005", "Teh", "gram", 2500, 500],
      ["ING-006", "Minyak Goreng", "ml", 9000, 1200]
    ];

    for (const ingredient of ingredients) {
      await connection.execute(
        `INSERT INTO ingredients (ingredient_code, ingredient_name, unit, stock_qty, minimum_stock)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE ingredient_name = VALUES(ingredient_name), unit = VALUES(unit), stock_qty = VALUES(stock_qty), minimum_stock = VALUES(minimum_stock)`,
        ingredient
      );
    }

    const [menuRows] = await connection.execute(
      `SELECT id, menu_code
       FROM menus
       WHERE menu_code IN ('MNU-001', 'MNU-002', 'MNU-003', 'MNU-004')`
    );

    const [ingredientRows] = await connection.execute(
      `SELECT id, ingredient_code
       FROM ingredients
       WHERE ingredient_code IN ('ING-001', 'ING-002', 'ING-003', 'ING-004', 'ING-005', 'ING-006')`
    );

    const menuIdByCode = new Map(menuRows.map((row) => [row.menu_code, Number(row.id)]));
    const ingredientIdByCode = new Map(ingredientRows.map((row) => [row.ingredient_code, Number(row.id)]));

    const recipes = [
      [menuIdByCode.get("MNU-001"), ingredientIdByCode.get("ING-001"), 180],
      [menuIdByCode.get("MNU-001"), ingredientIdByCode.get("ING-003"), 1],
      [menuIdByCode.get("MNU-001"), ingredientIdByCode.get("ING-006"), 30],
      [menuIdByCode.get("MNU-002"), ingredientIdByCode.get("ING-002"), 150],
      [menuIdByCode.get("MNU-002"), ingredientIdByCode.get("ING-003"), 1],
      [menuIdByCode.get("MNU-002"), ingredientIdByCode.get("ING-006"), 25],
      [menuIdByCode.get("MNU-003"), ingredientIdByCode.get("ING-005"), 10],
      [menuIdByCode.get("MNU-004"), ingredientIdByCode.get("ING-004"), 200],
      [menuIdByCode.get("MNU-004"), ingredientIdByCode.get("ING-006"), 40]
    ];

    for (const recipe of recipes) {
      await connection.execute(
        `INSERT INTO recipes (menu_id, ingredient_id, qty_needed)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE qty_needed = VALUES(qty_needed)`,
        recipe
      );
    }

    await connection.commit();
    console.log("Seed demo Wareb selesai.");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});