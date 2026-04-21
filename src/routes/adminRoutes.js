const express = require("express");
const {
	listAdminOrders,
	payOrder,
	listInventory,
	getAdminDashboard,
	listRecipes
} = require("../controllers/orderController");
const { requireCsrf } = require("../middleware/csrfProtection");
const { requireAuth, requireRole } = require("../middleware/auth");
const { validatePayOrder, handleValidation } = require("../middleware/validators");

const router = express.Router();

router.use(requireAuth, requireRole("ADMIN", "CASHIER"));

router.get("/dashboard", getAdminDashboard);
router.get("/orders", listAdminOrders);
router.patch("/orders/:orderId/pay", requireCsrf, validatePayOrder, handleValidation, payOrder);
router.get("/inventory", listInventory);
router.get("/recipes", listRecipes);

module.exports = router;
