import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_COOKIE = "cg_token";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isProtected =
    pathname.startsWith("/feed") ||
    pathname.startsWith("/u/") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/notifications");

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = token ? "/feed" : "/login";
    return NextResponse.redirect(url);
  }

  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthPage && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/feed";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/feed/:path*",
    "/u/:path*",
    "/chat",
    "/chat/:path*",
    "/notifications",
    "/notifications/:path*",
  ],
};
