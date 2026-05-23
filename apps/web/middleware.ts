import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextMiddleware, NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

const PROTECTED = ["/dashboard", "/organizer", "/select-plan"];

const intlMiddleware = createIntlMiddleware(routing);

const middleware = auth(async (req: NextRequest & { auth: unknown }) => {
  const { nextUrl } = req;
  const session = req.auth as { user?: { id?: string } } | null;
  const hasValidSession = session?.user?.id;

  // Strip locale prefix to check if the pathname is a protected route
  const pathname = nextUrl.pathname;
  // Remove locale prefix (e.g. /sv/dashboard → /dashboard)
  const pathnameWithoutLocale = pathname.replace(/^\/(sv|de)/, "") || "/";

  const isProtected = PROTECTED.some((p) => pathnameWithoutLocale.startsWith(p));

  if (isProtected && !hasValidSession) {
    const loginUrl = new URL("/login", nextUrl);
    const callback = pathnameWithoutLocale;
    if (callback.startsWith("/") && !callback.startsWith("//")) {
      loginUrl.searchParams.set("callbackUrl", callback);
    }
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(req);
});

export default middleware as unknown as NextMiddleware;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox|images).*)"],
};
