import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token;
    const isAuth = !!token;

    // 1. Jika akses area admin (kecuali halaman login /admin) tapi bukan ADMIN
    const isAdminPath = pathname.startsWith("/admin") && pathname !== "/admin";

    if (isAdminPath && isAuth && token?.role !== "ADMIN") {
      // User sudah login tapi bukan admin, kembalikan ke /admin
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // LOGIN LOOP FIX
    // Jika sudah login dan akses /admin (halaman login), redirect ke dashboard
    if (pathname === "/admin" && isAuth && token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // Jika belum login dan akses /admin/dashboard, redirect ke /admin
    if (pathname.startsWith("/admin/dashboard") && !isAuth) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // 2. Jika sudah login & punya store, tapi akses /setup
    if (pathname.startsWith("/setup") && isAuth && token?.storeId) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    return NextResponse.next();
  },

  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Halaman login admin harus publik
        if (pathname === "/admin") return true;

        // Path /admin/... dan /setup membutuhkan login
        if (pathname.startsWith("/admin") || pathname.startsWith("/setup")) {
          return !!token;
        }
        
        // Lainnya publik
        return true;
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/setup/:path*"
  ],
};

