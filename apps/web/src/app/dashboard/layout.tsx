import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/require-auth";
import { APP_BACKGROUND } from "@/lib/event-helpers";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();

  return (
    <div
      className="min-h-screen"
      style={{ background: APP_BACKGROUND }}
    >
      {/* Glass header */}
      <header
        className="sticky top-0 z-40 border-b border-[rgba(200,175,140,0.35)]"
        style={{
          background: "rgba(250, 244, 234, 0.82)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/dashboard"
            className="font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontSize: "1.25rem", color: "hsl(24 12% 20%)" }}
          >
            SeatSnaps
          </Link>
          <div className="flex items-center gap-3">
            {session.user?.isAdmin && (
              <Link
                href="/dashboard/admin"
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                style={{ color: "hsl(28 65% 44%)", border: "1px solid hsl(33 18% 82%)" }}
              >
                Admin
              </Link>
            )}
            <span className="text-sm" style={{ color: "hsl(28 8% 50%)" }}>
              {session.user?.name}
            </span>
            <Link
              href="/logout"
              className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              style={{ color: "hsl(28 65% 44%)", border: "1px solid hsl(33 18% 82%)" }}
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
