import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SLUG = process.env.NEXT_PUBLIC_ADMIN_SLUG || "techinfinix-console-77";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Direct /admin probing is strictly cloaked with 404 (Zero Discovery)
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const notFoundUrl = new URL("/_not-found", request.url);
    return NextResponse.rewrite(notFoundUrl, { status: 404 });
  }

  // 2. Exact secret slug visit: redirect to dashboard
  if (pathname === `/${ADMIN_SLUG}`) {
    return NextResponse.redirect(new URL(`/${ADMIN_SLUG}/dashboard`, request.url));
  }

  // 3. Secret slug subroutes: transparently rewrite to internal /admin/:path*
  if (pathname.startsWith(`/${ADMIN_SLUG}/`)) {
    const internalPath = pathname.replace(`/${ADMIN_SLUG}`, "/admin");
    const rewriteUrl = new URL(internalPath, request.url);
    rewriteUrl.search = request.nextUrl.search;
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
