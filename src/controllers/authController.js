const { loginUser } = require("../services/authService");

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: Number(process.env.AUTH_TOKEN_TTL_SECONDS || 60 * 60 * 8) * 1000
  };
}

async function login(req, res, next) {
  try {
    const { session, user } = await loginUser(req.body.email, req.body.password);

    res.cookie("wareb_session", session, sessionCookieOptions());
    res.status(200).json({ message: "Login berhasil.", user });
  } catch (error) {
    next(error);
  }
}

async function me(req, res) {
  res.status(200).json({ user: req.user });
}

async function logout(req, res) {
  res.clearCookie("wareb_session", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  res.status(200).json({ message: "Logout berhasil." });
}

module.exports = {
  login,
  me,
  logout
};