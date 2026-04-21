const crypto = require("crypto");
const { pool } = require("../config/db");
const { httpError } = require("../utils/httpError");

const TOKEN_TTL_SECONDS = Number(process.env.AUTH_TOKEN_TTL_SECONDS || 60 * 60 * 8);
const PASSWORD_ITERATIONS = Number(process.env.PASSWORD_ITERATIONS || 120000);
const PASSWORD_KEYLEN = 64;
const PASSWORD_DIGEST = "sha512";

function buildPasswordHash(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derived = crypto.pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEYLEN, PASSWORD_DIGEST);
  return `pbkdf2$${PASSWORD_ITERATIONS}$${salt}$${derived.toString("hex")}`;
}

function verifyPassword(password, storedHash) {
  const [scheme, iterationsValue, salt, hashValue] = String(storedHash).split("$");

  if (scheme !== "pbkdf2" || !iterationsValue || !salt || !hashValue) {
    return false;
  }

  const derived = crypto.pbkdf2Sync(
    password,
    salt,
    Number(iterationsValue),
    hashValue.length / 2,
    PASSWORD_DIGEST
  );

  return crypto.timingSafeEqual(Buffer.from(hashValue, "hex"), derived);
}

function signSession(payload) {
  const secret = process.env.AUTH_SECRET || "wareb-dev-secret";
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verifySession(token) {
  const secret = process.env.AUTH_SECRET || "wareb-dev-secret";
  const [body, signature] = String(token || "").split(".");

  if (!body || !signature) {
    return null;
  }

  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");

  if (signature.length !== expected.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  let payload;

  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch (error) {
    return null;
  }

  if (!payload.exp || Date.now() > payload.exp) {
    return null;
  }

  return payload;
}

async function loginUser(email, password) {
  const [rows] = await pool.execute(
    `SELECT id, full_name, email, password_hash, role, is_active
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  if (!rows.length) {
    throw httpError("Email atau password salah.", 401);
  }

  const user = rows[0];

  if (Number(user.is_active) !== 1) {
    throw httpError("Akun tidak aktif.", 403);
  }

  if (!verifyPassword(password, user.password_hash)) {
    throw httpError("Email atau password salah.", 401);
  }

  const session = signSession({
    sub: Number(user.id),
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    exp: Date.now() + TOKEN_TTL_SECONDS * 1000
  });

  return {
    session,
    user: {
      id: Number(user.id),
      full_name: user.full_name,
      email: user.email,
      role: user.role
    }
  };
}

module.exports = {
  buildPasswordHash,
  loginUser,
  signSession,
  verifySession
};