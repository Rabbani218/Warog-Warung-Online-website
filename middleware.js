import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // ─── /admin (login page) ───────────────────────────────────────────
  // If already authenticated as ADMIN → redirect straight to dashboard
  if (pathname === "/admin") {
    if (token && token.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    // Not logged in or not admin → show login page
    return NextResponse.next();
  }

  // ─── /admin/* (protected admin area) ──────────────────────────────
  if (pathname.startsWith("/admin/")) {
    // No session at all → kick to login
    if (!token) {
      const loginUrl = new URL("/admin", request.url);
      loginUrl.searchParams.set("error", "SessionExpired");
      loginUrl.searchParams.set("message", "Sesi Anda telah berakhir. Silakan login kembali.");
      return NextResponse.redirect(loginUrl);
    }

    // Has session but NOT an admin → kick to home with error
    if (token.role !== "ADMIN") {
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("error", "Unauthorized");
      return NextResponse.redirect(homeUrl);
    }

    // Is ADMIN → allow through (store check happens at page level)
    return NextResponse.next();
  }

  // ─── /setup (store initialization) ────────────────────────────────
  if (pathname.startsWith("/setup")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    // If admin already has a store cached in token, redirect to dashboard
    if (token.storeId) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Only match admin and setup routes — don't intercept API, static, or client routes
export const config = {
  matcher: ["/admin", "/admin/:path*", "/setup/:path*"],
};
