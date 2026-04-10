import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Routes that require authentication
const AUTH_REQUIRED = ["/assess"];

const CUSTOMER_ALLOWED = ["/assess", "/api/assess"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Check if this route requires auth
  const needsAuth = AUTH_REQUIRED.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!needsAuth) return NextResponse.next();

  // Require login for protected routes
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = (req.auth.user as { role?: string })?.role ?? "customer";

  // Customer role: restrict to /assess and /assess/*
  if (role === "customer") {
    const isAllowed = CUSTOMER_ALLOWED.some((p) => pathname === p || pathname.startsWith(p + "/"));
    if (!isAllowed) {
      return NextResponse.redirect(new URL("/assess", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|screenshots|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
