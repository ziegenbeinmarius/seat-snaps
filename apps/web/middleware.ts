import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextMiddleware, NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/organizer"];
const AUTH_ONLY = ["/login", "/register"];

const middleware = auth(async (req: NextRequest & { auth: unknown }) => {
  const { nextUrl } = req;
  const session = req.auth as { user?: { id?: string } } | null;

  const isProtected = PROTECTED.some((p) => nextUrl.pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY.some((p) => nextUrl.pathname.startsWith(p));

  if (isProtected && !session) {
    const loginUrl = new URL("/login", nextUrl);
    const callback = nextUrl.pathname;
    if (callback.startsWith("/") && !callback.startsWith("//")) {
      loginUrl.searchParams.set("callbackUrl", callback);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthOnly && session) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }
});

export default middleware as unknown as NextMiddleware;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json).*)"],
};
