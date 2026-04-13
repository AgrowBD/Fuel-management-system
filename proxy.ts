// Route protection proxy (Next.js 16 — export must be named "proxy" or default).
// Reads the NextAuth session cookie directly — lightweight, no heavy imports.
// Role enforcement happens server-side in each layout/page via getServerSession.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/owner", "/operator", "/admin"];
const SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has(SESSION_COOKIE);

  // Unauthenticated → /login
  if (PROTECTED.some((p) => pathname.startsWith(p)) && !hasSession) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Already logged in → away from /login
  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/owner/:path*", "/operator/:path*", "/admin/:path*"],
};
