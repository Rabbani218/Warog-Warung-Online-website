const crypto = require("crypto");
const { httpError } = require("../utils/httpError");

function issueCsrfToken(req, res) {
  const token = crypto.randomBytes(24).toString("hex");

  res.cookie("XSRF-TOKEN", token, {
    sameSite: "lax",
    secure: false
  });

  res.status(200).json({ csrfToken: token });
}

function requireCsrf(req, res, next) {
  const tokenFromCookie = req.cookies["XSRF-TOKEN"];
  const tokenFromHeader = req.headers["x-csrf-token"];

  if (!tokenFromCookie || !tokenFromHeader || tokenFromCookie !== tokenFromHeader) {
    return next(httpError("Invalid CSRF token.", 403));
  }

  next();
}

module.exports = { issueCsrfToken, requireCsrf };
