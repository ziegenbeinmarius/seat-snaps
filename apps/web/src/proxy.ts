import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextProxy, NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const PROTECTED = ["/dashboard", "/organizer", "/select-plan"];

const intlProxy = createIntlMiddleware(routing);

const proxy = auth(async (req: NextRequest & { auth: unknown }) => {
  const { nextUrl } = req;
  const session = req.auth as { user?: { id?: string } } | null;
  const hasValidSession = session?.user?.id;
  const pathname = nextUrl.pathname;

  // QR-token join routes are Route Handlers, not pages — skip locale rewriting.
  const isQrJoinRoute =
    /^(?:\/(sv|de|en))?\/join\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pathname);
  if (isQrJoinRoute) {
    return NextResponse.next();
  }

  // Detect locale prefix — with localePrefix:"as-needed" English has no prefix
  const localeMatch = pathname.match(/^\/(sv|de|en)(\/|$)/);
  const activeLocale = localeMatch ? localeMatch[1] : "en";
  const localeSegment = activeLocale !== "en" ? `/${activeLocale}` : "";
  const pathnameWithoutLocale = pathname.replace(/^\/(sv|de|en)/, "") || "/";

  const isProtected = PROTECTED.some((p) => pathnameWithoutLocale.startsWith(p));

  if (isProtected && !hasValidSession) {
    const loginUrl = new URL(`${localeSegment}/login`, nextUrl);
    const callback = pathnameWithoutLocale;
    if (callback.startsWith("/") && !callback.startsWith("//")) {
      loginUrl.searchParams.set("callbackUrl", callback);
    }
    return NextResponse.redirect(loginUrl);
  }

  return intlProxy(req);
});

export default proxy as unknown as NextProxy;

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
