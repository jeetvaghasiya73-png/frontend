import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SLUG = process.env.NEXT_PUBLIC_ADMIN_SLUG || "techinfinix-console-77";
const ADMIN_DOMAIN = (process.env.NEXT_PUBLIC_ADMIN_DOMAIN || "admin.techinfinix.com").toLowerCase();

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Robust hostname resolution (supports Cloudflare, Vercel edge, and local test hosts)
  const xForwardedHost = request.headers.get("x-forwarded-host") || "";
  const hostHeader = request.headers.get("host") || "";
  const urlHostname = request.nextUrl.hostname || "";

  const rawHost = (xForwardedHost || hostHeader || urlHostname).split(":")[0].toLowerCase();
  const isSubdomainAdmin = (
    rawHost === ADMIN_DOMAIN ||
    rawHost.startsWith("admin.") ||
    rawHost === "admin.localhost"
  );

  // ── 1. SUBDOMAIN ROUTING (admin.techinfinix.com) ───────────────────────────
  if (isSubdomainAdmin) {
    // A. If visiting legacy secret slug on admin subdomain, redirect cleanly to /dashboard
    // e.g. admin.techinfinix.com/techinfinix-console-77/dashboard -> admin.techinfinix.com/dashboard
    if (pathname === `/${ADMIN_SLUG}` || pathname.startsWith(`/${ADMIN_SLUG}/`)) {
      const cleanPath = pathname.replace(`/${ADMIN_SLUG}`, "") || "/dashboard";
      const cleanUrl = request.nextUrl.clone();
      cleanUrl.pathname = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
      return NextResponse.redirect(cleanUrl);
    }

    // B. Root visit on admin subdomain -> redirect directly to /dashboard
    if (pathname === "" || pathname === "/") {
      const dashUrl = request.nextUrl.clone();
      dashUrl.pathname = "/dashboard";
      return NextResponse.redirect(dashUrl);
    }

    // C. Rewrite clean paths to internal /admin app routes preserving Next.js router context
    // e.g. /dashboard -> /admin/dashboard
    // e.g. /dashboard/sales-calls/queue -> /admin/dashboard/sales-calls/queue
    // e.g. /login -> /admin/login
    if (!pathname.startsWith("/admin/")) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = `/admin${pathname}`;
      return NextResponse.rewrite(rewriteUrl);
    }

    return NextResponse.next();
  }

  // ── 2. NORMAL DOMAIN ROUTING (techinfinix.com) ─────────────────────────────
  // STRICT SECURITY: Remove all admin and dashboard access from the normal marketing domain.
  // Any attempt to access /admin, /techinfinix-console-77, or /dashboard returns 404 Not Found.
  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === `/${ADMIN_SLUG}` ||
    pathname.startsWith(`/${ADMIN_SLUG}/`) ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/")
  ) {
    const notFoundUrl = request.nextUrl.clone();
    notFoundUrl.pathname = "/_not-found";
    return NextResponse.rewrite(notFoundUrl, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, sw.js (PWA assets)
     * - public files (images, icons, fonts)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)$).*)",
  ],
};
