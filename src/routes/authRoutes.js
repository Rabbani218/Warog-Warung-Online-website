const express = require("express");
const { login, me, logout } = require("../controllers/authController");
const { requireCsrf } = require("../middleware/csrfProtection");
const { requireAuth } = require("../middleware/auth");
const { validateLogin, handleValidation } = require("../middleware/validators");

const router = express.Router();

router.post("/login", validateLogin, handleValidation, login);
router.get("/me", requireAuth, me);
router.post("/logout", requireCsrf, requireAuth, logout);

module.exports = router;