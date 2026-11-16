import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Fast first check: no session cookie → go to sign-in.
 * This only looks at the cookie; every protected page still verifies the
 * session against the database (requireUser / requireAdmin).
 */
export function middleware(request: NextRequest) {
  const hasSession = !!getSessionCookie(request);
  const { pathname, search } = request.nextUrl;

  if (!hasSession) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
