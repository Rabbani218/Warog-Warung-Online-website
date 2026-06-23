import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Middleware ini HANYA berlaku untuk path /admin/* dan /setup/*
 * (lihat config.matcher di bawah).
 *
 * Halaman klien (/, /product/*, /invoice/*) TIDAK disentuh middleware ini,
 * sehingga tidak ada risiko redirect loop untuk user CLIENT.
 */
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token;
    const isAuth = !!token;
    const isAdmin = token?.role === "ADMIN";

    // Normalisasi trailing slash
    const path =
      pathname.endsWith("/") && pathname !== "/"
        ? pathname.slice(0, -1)
        : pathname;

    // ── /admin (halaman login admin) ────────────────────────────────────────
    if (path === "/admin") {
      // Admin yang sudah login → langsung ke dashboard
      if (isAuth && isAdmin) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      // Semua lainnya → tampilkan halaman login
      return NextResponse.next();
    }

    // ── /admin/* (protected admin pages) ───────────────────────────────────
    if (path.startsWith("/admin/")) {
      // Belum login → ke halaman login admin
      if (!isAuth) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      // Sudah login tapi bukan ADMIN → ke halaman login admin
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      // Admin valid → lanjut
      return NextResponse.next();
    }

    // ── /setup/* ────────────────────────────────────────────────────────────
    if (path.startsWith("/setup")) {
      // Admin dengan store sudah ada → tidak perlu setup lagi
      if (isAuth && isAdmin && token?.storeId) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  },

  {
    callbacks: {
      // authorized() menentukan apakah middleware function di atas dipanggil.
      // Kembalikan true selalu — kita handle auth sendiri di atas.
      // Ini penting agar middleware tidak otomatis redirect ke /admin
      // untuk path yang tidak butuh auth (seperti /setup).
      authorized: () => true,
    },
    pages: {
      signIn: "/admin",
      error: "/admin",
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_dev_only",
  }
);

export const config = {
  // Hanya intercept admin dan setup — JANGAN tambahkan "/" atau "/(client)/*"
  // karena itu akan menyebabkan session check pada halaman publik
  // yang bisa trigger redirect loop jika session sedang loading
  matcher: ["/admin", "/admin/:path*", "/setup", "/setup/:path*"],
};
