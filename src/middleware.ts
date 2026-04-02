import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Injects `x-pathname` header so that server-side layouts can read
 * the current URL path (Next.js App Router layouts don't expose it directly).
 */
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("x-pathname", req.nextUrl.pathname);
  return res;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
