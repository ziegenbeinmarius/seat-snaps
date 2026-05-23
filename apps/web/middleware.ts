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

  // Explicitly redirect bare root to /en so the [locale] segment is always present.
  // next-intl's internal rewrite can be bypassed when wrapped inside auth(); this
  // explicit redirect guarantees `/` always lands on the English landing page.
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/en", nextUrl));
  }

  // Detect locale prefix — with localePrefix:"as-needed" English has no prefix
  const localeMatch = pathname.match(/^\/(sv|de|en)(\/|$)/);
  const activeLocale = localeMatch ? localeMatch[1] : "en";
  const localeSegment = activeLocale !== "en" ? `/${activeLocale}` : "";

  // Strip locale prefix to test if the bare path is protected
  const pathnameWithoutLocale = pathname.replace(/^\/(sv|de|en)/, "") || "/";

  const isProtected = PROTECTED.some((p) => pathnameWithoutLocale.startsWith(p));

  if (isProtected && !hasValidSession) {
    // Redirect to /login (or /sv/login, /de/login) to preserve the user's language
    const loginUrl = new URL(`${localeSegment}/login`, nextUrl);
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
