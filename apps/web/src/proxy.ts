import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const PROTECTED = ["/dashboard", "/organizer", "/select-plan"];

const intlProxy = createIntlMiddleware(routing);

// Heuristic: presence of a NextAuth session-token cookie (any name variant).
// We don't verify the JWT in Edge middleware — verification happens server-side
// via auth() in pages/layouts. We just gate the redirect on "looks logged in".
function hasSessionCookie(req: NextRequest): boolean {
  const cookies = req.cookies;
  return (
    cookies.has("authjs.session-token") ||
    cookies.has("__Secure-authjs.session-token") ||
    cookies.has("__Host-authjs.session-token") ||
    cookies.has("next-auth.session-token") ||
    cookies.has("__Secure-next-auth.session-token")
  );
}

export default function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const localeMatch = pathname.match(/^\/(sv|de|en)(\/|$)/);
  const activeLocale = localeMatch ? localeMatch[1] : "en";
  const localeSegment = activeLocale !== "en" ? `/${activeLocale}` : "";
  const pathnameWithoutLocale = pathname.replace(/^\/(sv|de|en)/, "") || "/";

  const isProtected = PROTECTED.some((p) => pathnameWithoutLocale.startsWith(p));

  if (isProtected && !hasSessionCookie(req)) {
    const loginUrl = new URL(`${localeSegment}/login`, nextUrl);
    const callback = pathnameWithoutLocale;
    if (callback.startsWith("/") && !callback.startsWith("//")) {
      loginUrl.searchParams.set("callbackUrl", callback);
    }
    return NextResponse.redirect(loginUrl);
  }

  return intlProxy(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
