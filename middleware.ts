import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = [
  "/dashboard", "/tooling", "/injection", "/sales",
  "/financial", "/risks", "/reports", "/settings",
  "/crm", "/org-chart",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (isDemoMode) {
    const isProtected = PROTECTED.some(p => pathname.startsWith(p));
    if (isProtected) {
      const demoSession = request.cookies.get("demo_session");
      if (!demoSession) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
