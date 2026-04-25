import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token;
    const isAuth = !!token;

    // Normalisasi pathname untuk menangani trailing slashes secara konsisten
    const path = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

    // 1. Jika akses area admin (kecuali halaman login /admin) tapi bukan ADMIN
    const isAdminPath = path.startsWith("/admin") && path !== "/admin";
    
    // Jangan redirect jika kita sudah berada di /admin (Halaman Login)
    if (path === "/admin") {
      // Jika sudah login dan ADMIN, baru kita arahkan ke dashboard
      if (isAuth && token?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.next();
    }

    if (isAdminPath && isAuth && token?.role !== "ADMIN") {
      // User sudah login tapi bukan admin, kembalikan ke /admin
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // Jika belum login dan akses /admin/dashboard, redirect ke /admin
    if (path.startsWith("/admin/dashboard") && !isAuth) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // 2. Jika sudah login & punya store, tapi akses /setup
    if (path.startsWith("/setup") && isAuth && token?.storeId) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    return NextResponse.next();
  },

  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const path = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
        
        // Halaman login admin harus publik
        if (path === "/admin") return true;

        // Path /admin/... dan /setup membutuhkan login
        if (path.startsWith("/admin") || path.startsWith("/setup")) {
          return !!token;
        }
        
        // Lainnya publik
        return true;
      },
    },
    pages: {
      signIn: "/admin",
      error: "/admin",
    },
    // Pastikan secret sama dengan yang ada di lib/auth.js untuk menghindari kegagalan dekripsi token
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_dev_only",
  }
);

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/setup",
    "/setup/:path*"
  ],
};

