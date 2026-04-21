import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Kecualikan static files, next internal, API, dan halaman publik
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // /admin adalah halaman login
  if (pathname === "/admin") {
    if (token && token.role === "ADMIN") {
      if (token.storeId) {
         return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else {
         return NextResponse.redirect(new URL("/setup", request.url));
      }
    }
    return NextResponse.next();
  }

  // Izinkan akses /setup jika sudah login (meskipun belum punya store)
  if (pathname.startsWith("/setup")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    // Jika sudah punya store, cegah ke setup
    if (token.storeId) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Proteksi area admin
  if (pathname.startsWith("/admin/")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!token.storeId) {
      return NextResponse.redirect(new URL("/setup", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
