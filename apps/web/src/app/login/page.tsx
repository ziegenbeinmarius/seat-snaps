import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background: "linear-gradient(160deg, #f5ede0 0%, #f0e6d4 40%, #ede0cc 100%)",
      }}
    >
      <div className="w-full max-w-sm space-y-6">
        {/* Logo / brand */}
        <div className="text-center">
          <h1
            className="text-4xl font-semibold tracking-tight"
            style={{
              fontFamily: "var(--font-cormorant, Georgia, serif)",
              color: "hsl(24 12% 20%)",
            }}
          >
            SeatSnaps
          </h1>
          <p className="mt-1 text-sm" style={{ color: "hsl(28 8% 52%)" }}>
            Sign in to your account
          </p>
        </div>

        {/* Glass card */}
        <div className="dashboard-glass rounded-2xl p-6">
          <LoginForm />
        </div>

        <p className="text-center text-sm" style={{ color: "hsl(28 8% 52%)" }}>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium hover:underline"
            style={{ color: "hsl(28 65% 44%)" }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
