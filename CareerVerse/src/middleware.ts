import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware performs a fast presence check on the session cookie to gate
 * routes. Authoritative verification (via the Admin SDK) happens in the
 * authenticated layouts and API routes — the Admin SDK cannot run on the edge.
 */
const SESSION_COOKIE = "__session";
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];
const PROTECTED_PREFIXES = [
  "/onboarding",
  "/dashboard",
  "/assessment",
  "/recommendations",
  "/careers",
  "/compare",
  "/roadmap",
  "/timeline",
  "/learning",
  "/resume",
  "/interviews",
  "/achievements",
  "/coach",
  "/profile",
  "/settings",
  "/companies",
  "/analytics",
  "/skill-gap",
  "/portfolio",
  "/pricing",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/assessment/:path*",
    "/recommendations/:path*",
    "/careers/:path*",
    "/compare/:path*",
    "/roadmap/:path*",
    "/timeline/:path*",
    "/learning/:path*",
    "/resume/:path*",
    "/interviews/:path*",
    "/achievements/:path*",
    "/coach/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/companies/:path*",
    "/analytics/:path*",
    "/skill-gap/:path*",
    "/portfolio/:path*",
    "/pricing/:path*",
    "/login",
    "/signup",
    "/forgot-password",
  ],
};
