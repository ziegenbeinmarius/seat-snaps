import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import jwt from "jsonwebtoken";
import { LoginSchema } from "@seat-snaps/shared";

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

export const { handlers, auth, signIn, signOut } = NextAuth({
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
      return jwt.sign(token as object, signingSecret, {
        algorithm: "HS256",
        expiresIn: maxAge ?? 30 * 24 * 60 * 60,
      });
    },
    async decode({ secret, token }) {
      if (!token) return null;
      const signingSecret = Array.isArray(secret) ? secret[0] : (secret as string);
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
