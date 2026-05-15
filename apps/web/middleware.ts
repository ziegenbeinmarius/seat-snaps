import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextMiddleware, NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/organizer"];
const AUTH_ONLY = ["/login", "/register"];

function clearAuthCookies(req: NextRequest, response: NextResponse) {
  const authCookieRegex = /^(?:__Secure-)?(?:authjs|next-auth)\.session-token(?:\.\d+)?$/;
  for (const cookie of req.cookies.getAll()) {
    if (authCookieRegex.test(cookie.name)) {
      response.cookies.delete(cookie.name);
    }
  }
}

async function isSessionUserStillValid(userId: string): Promise<boolean> {
  const apiUrl = process.env.INTERNAL_API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${apiUrl}/api/auth/users/${userId}/exists`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { exists?: boolean };
    return data.exists === true;
  } catch {
    return false;
  }
}

const middleware = auth(async (req: NextRequest & { auth: unknown }) => {
  const { nextUrl } = req;
  const session = req.auth as { user?: { id?: string } } | null;

  if (session?.user?.id) {
    const stillValid = await isSessionUserStillValid(session.user.id);
    if (!stillValid) {
      const loginUrl = new URL("/login", nextUrl);
      const response = NextResponse.redirect(loginUrl);
      clearAuthCookies(req, response);
      return response;
    }
  }

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

export default middleware as unknown as NextMiddleware;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json).*)"],
};
