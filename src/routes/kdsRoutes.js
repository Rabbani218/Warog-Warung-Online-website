const express = require("express");
const { streamKdsOrders } = require("../controllers/kdsController");
const { listKitchenQueue, updateKitchenStatus } = require("../controllers/orderController");
const { requireCsrf } = require("../middleware/csrfProtection");
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  validateOrderStatusUpdate,
  handleValidation
} = require("../middleware/validators");

const router = express.Router();

router.use(requireAuth, requireRole("ADMIN", "KITCHEN"));

router.get("/orders/stream", streamKdsOrders);
router.get("/orders/queue", listKitchenQueue);
router.patch("/orders/:orderId/status", requireCsrf, validateOrderStatusUpdate, handleValidation, updateKitchenStatus);

module.exports = router;
