import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const isAuth = !!token;
    const pathname = req.nextUrl.pathname;

    // 1. If trying to access admin dashboard but not an admin
    if (pathname.startsWith("/admin/") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // 2. If logged in but trying to access setup while already having a store
    if (pathname.startsWith("/setup") && isAuth && token?.storeId) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Only require auth for these specific paths
        if (
          (pathname.startsWith("/admin") && pathname !== "/admin") || 
          pathname.startsWith("/setup")
        ) {
          return !!token;
        }
        
        // Public by default
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path+",
    "/setup/:path*"
  ],
};

