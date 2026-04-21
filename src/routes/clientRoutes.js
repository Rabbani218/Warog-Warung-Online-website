const express = require("express");
const {
	listMenus,
	checkoutOrder,
	getReceiptAndKot
} = require("../controllers/orderController");
const { requireCsrf } = require("../middleware/csrfProtection");
const {
	validateCheckout,
	validateOrderIdParam,
	handleValidation
} = require("../middleware/validators");

const router = express.Router();

router.get("/menus", listMenus);
router.post("/orders/checkout", requireCsrf, validateCheckout, handleValidation, checkoutOrder);
router.get("/orders/:orderId/split", validateOrderIdParam, handleValidation, getReceiptAndKot);

module.exports = router;
