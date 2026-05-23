import NextAuth, { type DefaultSession, type NextAuthResult } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";
import jwt from "jsonwebtoken";
import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { LoginSchema } from "@seat-snaps/shared";

const envCandidates = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "../../.env"),
];

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    loadEnv({ path: envPath });
    break;
  }
}

const authSecret =
  process.env.AUTH_SECRET
  ?? process.env.NEXTAUTH_SECRET
  ?? process.env.auth_secret;

const trustHost = process.env.AUTH_TRUST_HOST
  ? process.env.AUTH_TRUST_HOST === "true"
  : true;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string | null;
      isAdmin?: boolean;
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    role?: string | null;
    isAdmin?: boolean;
    tokenVersion?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string | null;
    isAdmin?: boolean;
    tokenVersion?: number;
    checkedAt?: number;
  }
}

const nextAuth: NextAuthResult = NextAuth({
  secret: authSecret,
  trustHost,
  logger: {
    error(error) {
      // A session cookie that can't be verified (expired, or signed with an
      // older AUTH_SECRET) just means the visitor isn't signed in — an
      // expected state on public pages, not an error worth surfacing.
      // @auth/core throws "Invalid JWT" here; swallow only that case.
      if ((error as { name?: string } | undefined)?.name === "JWTSessionError") {
        return;
      }
      console.error("[auth][error]", error);
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const apiUrl = process.env.INTERNAL_API_URL ?? "http://localhost:3001";
        try {
          const res = await fetch(`${apiUrl}/api/auth/validate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsed.data),
          });
          if (!res.ok) return null;
          return res.json();
        } catch {
          return null;
        }
      },
    }),
  ],
  jwt: {
    async encode({ secret, token, maxAge }) {
      if (!token) return "";
      const signingSecret = Array.isArray(secret) ? secret[0] : (secret as string);
      if (!signingSecret) return "";

      const payload = { ...(token as Record<string, unknown>) };
      const hasExp = typeof payload.exp === "number";

      if (hasExp) {
        return jwt.sign(payload, signingSecret, { algorithm: "HS256" });
      }

      return jwt.sign(payload, signingSecret, {
        algorithm: "HS256",
        expiresIn: maxAge ?? 30 * 24 * 60 * 60,
      });
    },
    async decode({ secret, token }) {
      if (!token) return null;
      const signingSecret = Array.isArray(secret) ? secret[0] : (secret as string);
      if (!signingSecret) return null;
      try {
        return jwt.verify(token, signingSecret, { algorithms: ["HS256"] }) as JWT;
      } catch {
        return null;
      }
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
          const apiUrl = process.env.INTERNAL_API_URL ?? "http://localhost:3001";
          try {
            const res = await fetch(`${apiUrl}/api/auth/oauth`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                avatarUrl: user.image ?? undefined,
              }),
            });
            if (res.ok) {
              const dbUser = (await res.json()) as {
                id: string;
                role?: string | null;
                isAdmin?: boolean;
                tokenVersion?: number;
              };
              token.id = dbUser.id;
              token.role = dbUser.role ?? null;
              token.isAdmin = dbUser.isAdmin ?? false;
              token.tokenVersion = dbUser.tokenVersion ?? 0;
              token.checkedAt = Math.floor(Date.now() / 1000);
              return token;
            }
          } catch {
            return token;
          }
        }

        token.id = user.id;
        token.role = user.role ?? null;
        token.isAdmin = user.isAdmin ?? false;
        token.tokenVersion = user.tokenVersion ?? 0;
        token.checkedAt = Math.floor(Date.now() / 1000);
        return token;
      }

      const now = Math.floor(Date.now() / 1000);
      const lastChecked = typeof token.checkedAt === "number" ? token.checkedAt : 0;
      if (now - lastChecked > 5 * 60) {
        const apiUrl = process.env.INTERNAL_API_URL ?? "http://localhost:3001";
        try {
          const bearer = jwt.sign({ id: token.id }, authSecret!, { algorithm: "HS256", expiresIn: 30 });
          const res = await fetch(`${apiUrl}/api/auth/users/${token.id}/token-version`, {
            headers: { Authorization: `Bearer ${bearer}` },
          });
          if (res.ok) {
            const body = (await res.json()) as {
              exists: boolean;
              tokenVersion: number | null;
              isAdmin?: boolean;
            };
            if (!body.exists) return null;
            if (body.tokenVersion !== null && (token.tokenVersion ?? 0) < body.tokenVersion) {
              return null;
            }
            token.isAdmin = body.isAdmin ?? token.isAdmin ?? false;
          }
        } catch {
          // Network error — keep session valid rather than logging everyone out
        }
        token.checkedAt = now;
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.isAdmin = token.isAdmin ?? false;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { handlers, auth, signIn, signOut } = nextAuth as any;
export { handlers, auth, signIn, signOut };
