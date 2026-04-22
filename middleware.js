import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // PROTECTED ADMIN ROUTES: /admin/... (dashboard, products, etc.)
  // We exclude the root "/admin" (login page) from this check via matcher
  if (pathname.startsWith("/admin/")) {
    if (!token || token.role !== "ADMIN") {
      // Redirect to home or setup instead of /admin to break any potential loops
      const url = new URL("/", request.url);
      url.searchParams.set("error", "Unauthorized");
      return NextResponse.redirect(url);
    }
  }

  // SETUP ROUTES: /setup/...
  if (pathname.startsWith("/setup")) {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (token.storeId) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/setup/:path*"],
};
