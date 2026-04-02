import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Injects `x-pathname` as a REQUEST header so server components
 * can read it via headers(). Response headers are NOT readable by
 * server components — the header must be forwarded on the request.
 */
export function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
