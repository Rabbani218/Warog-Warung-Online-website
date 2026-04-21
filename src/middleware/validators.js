const { body, param, validationResult } = require("express-validator");
const { httpError } = require("../utils/httpError");

const validateCheckout = [
  body("table_number").isString().trim().isLength({ min: 1, max: 20 }),
  body("customer_name").optional().isString().trim().isLength({ max: 120 }),
  body("items").isArray({ min: 1 }),
  body("items.*.menu_id").isInt({ min: 1 }),
  body("items.*.qty").isInt({ min: 1 }),
  body("items.*.note").optional().isString().isLength({ max: 255 }),
  body("tax_percent").optional().isFloat({ min: 0, max: 100 }),
  body("discount_amount").optional().isFloat({ min: 0 })
];

const validatePayOrder = [
  param("orderId").isInt({ min: 1 }),
  body("payment_method").isIn(["CASH", "QRIS", "DEBIT", "CREDIT"]),
  body("paid_by").optional().isInt({ min: 1 })
];

const validateLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 6, max: 120 })
];

const validateOrderStatusUpdate = [
  param("orderId").isInt({ min: 1 }),
  body("status").isIn(["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"])
];

const validateOrderIdParam = [param("orderId").isInt({ min: 1 })];

function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(httpError(`Input tidak valid: ${result.array()[0].msg}`, 422));
  }

  next();
}

module.exports = {
  validateCheckout,
  validatePayOrder,
  validateLogin,
  validateOrderStatusUpdate,
  validateOrderIdParam,
  handleValidation
};
