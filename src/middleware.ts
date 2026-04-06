import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public pages
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  // Allow API routes — they handle their own auth
  if (pathname.startsWith("/api/")) return NextResponse.next();

  // Require login for everything else
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|screenshots|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
