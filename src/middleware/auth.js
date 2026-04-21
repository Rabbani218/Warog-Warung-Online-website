const { httpError } = require("../utils/httpError");
const { verifySession } = require("../services/authService");

function attachAuthUser(req, res, next) {
  const token = req.cookies.wareb_session;

  if (!token) {
    req.user = null;
    return next();
  }

  const session = verifySession(token);

  if (!session) {
    req.user = null;
    return next();
  }

  req.user = {
    id: Number(session.sub),
    full_name: session.full_name,
    email: session.email,
    role: session.role
  };

  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return next(httpError("Silakan login terlebih dahulu.", 401));
  }

  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(httpError("Silakan login terlebih dahulu.", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(httpError("Anda tidak memiliki akses ke resource ini.", 403));
    }

    next();
  };
}

module.exports = {
  attachAuthUser,
  requireAuth,
  requireRole
};