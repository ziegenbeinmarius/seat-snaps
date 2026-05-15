import { auth } from "./auth";
import { NextResponse } from "next/server";

const PROTECTED = ["/dashboard"];
const AUTH_ONLY = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;

  const isProtected = PROTECTED.some((p) => nextUrl.pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY.some((p) => nextUrl.pathname.startsWith(p));

  if (isProtected && !session) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthOnly && session) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json).*)"],
};
