// ──────────────────────────────────────────────────────────────────────
// Middleware — TEMPORARILY DISABLED (Scorched Earth Reset)
//
// All route interception is turned off to break an infinite redirect
// loop between middleware ↔ /setup ↔ / ↔ /admin.
//
// Auth protection is still enforced by the (protected) layout server
// check in app/(admin)/admin/(protected)/layout.js.
//
// Re-enable gradually once the redirect loop is confirmed resolved.
// ──────────────────────────────────────────────────────────────────────

export function middleware() {
  // pass-through — no interception
  return;
}

export const config = {
  // keep the matcher so Next.js still registers the middleware file,
  // but the function above is a no-op
  matcher: [],
};
