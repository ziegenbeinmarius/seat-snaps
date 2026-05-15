import NextAuth, { type DefaultSession, type NextAuthResult } from "next-auth";
import Credentials from "next-auth/providers/credentials";
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
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    role?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string | null;
  }
}

const nextAuth: NextAuthResult = NextAuth({
  secret: authSecret,
  trustHost,
  providers: [
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
    // Use standard JWS so the NestJS API can verify Auth.js tokens directly
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
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? null;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
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
