import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SLUG = process.env.NEXT_PUBLIC_ADMIN_SLUG || "techinfinix-console-77";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const isSubdomainAdmin = host.startsWith("admin.") || host === "admin.techinfinix.com";

  // ── SUBDOMAIN ROUTING (admin.techinfinix.com) ─────────────────────────────
  if (isSubdomainAdmin) {
    // 1. If visiting secret slug on admin subdomain, redirect immediately to clean URL
    // e.g. admin.techinfinix.com/techinfinix-console-77/dashboard -> admin.techinfinix.com/dashboard
    if (pathname === `/${ADMIN_SLUG}` || pathname.startsWith(`/${ADMIN_SLUG}/`)) {
      const cleanPath = pathname.replace(`/${ADMIN_SLUG}`, "") || "/dashboard";
      const cleanUrl = new URL(cleanPath, request.url);
      cleanUrl.search = request.nextUrl.search;
      return NextResponse.redirect(cleanUrl);
    }

    // 2. Root visit on admin subdomain -> /dashboard
    if (pathname === "") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 3. Rewrite clean paths to internal /admin routes
    // e.g. /dashboard -> /admin/dashboard
    // e.g. /login -> /admin/login
    if (!pathname.startsWith("/admin/")) {
      const internalUrl = new URL(`/admin${pathname}`, request.url);
      internalUrl.search = request.nextUrl.search;
      return NextResponse.rewrite(internalUrl);
    }

    return NextResponse.next();
  }

  // ── MAIN DOMAIN ROUTING (techinfinix.com) ─────────────────────────────────
  // Remove all dashboard and admin access from the normal marketing domain.
  // Any attempt to access /admin, /techinfinix-console-77, or /dashboard redirects to admin.techinfinix.com
  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === `/${ADMIN_SLUG}` ||
    pathname.startsWith(`/${ADMIN_SLUG}/`) ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/")
  ) {
    const adminUrl = new URL(request.url);
    adminUrl.host = "admin.techinfinix.com";
    adminUrl.port = "";
    // Clean URL: strip secret slug
    const cleanPath = pathname.replace(`/${ADMIN_SLUG}`, "").replace(/^\/admin/, "") || "/dashboard";
    adminUrl.pathname = cleanPath.startsWith("/dashboard") || cleanPath.startsWith("/login") ? cleanPath : `/dashboard${cleanPath}`;
    return NextResponse.redirect(adminUrl, 301);
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
