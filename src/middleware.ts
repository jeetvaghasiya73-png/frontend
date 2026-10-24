import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SLUG = process.env.NEXT_PUBLIC_ADMIN_SLUG || "techinfinix-console-77";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const isSubdomainAdmin = host.startsWith("admin.") || host === "admin.techinfinix.com";

  // ── SUBDOMAIN ROUTING (admin.techinfinix.com) ─────────────────────────────
  if (isSubdomainAdmin) {
    // Root visit on admin subdomain -> dashboard or login
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.rewrite(url);
    }
    // If the path already has /admin, let it proceed internally
    if (pathname.startsWith("/admin/")) {
      return NextResponse.next();
    }
    // If visiting secret slug on admin subdomain, normalize to clean path
    if (pathname.startsWith(`/${ADMIN_SLUG}`)) {
      const cleanPath = pathname.replace(`/${ADMIN_SLUG}`, "/admin") || "/admin/dashboard";
      const rewriteUrl = new URL(cleanPath, request.url);
      rewriteUrl.search = request.nextUrl.search;
      return NextResponse.rewrite(rewriteUrl);
    }
    // Clean dashboard routes e.g. admin.techinfinix.com/dashboard/leads -> internal /admin/dashboard/leads
    const internalUrl = new URL(`/admin${pathname}`, request.url);
    internalUrl.search = request.nextUrl.search;
    return NextResponse.rewrite(internalUrl);
  }

  // ── MAIN DOMAIN ROUTING (techinfinix.com) ─────────────────────────────────
  // 1. Direct /admin probing on main domain is strictly cloaked with 404
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
