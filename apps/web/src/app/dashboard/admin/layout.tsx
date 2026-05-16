import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/require-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  if (!session.user?.isAdmin) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "hsl(24 12% 20%)" }}
        >
          Admin
        </h1>
        <p className="mt-1 text-sm" style={{ color: "hsl(28 8% 50%)" }}>
          System administration and metrics
        </p>
      </div>
      <nav className="flex gap-1 rounded-lg border border-[rgba(200,175,140,0.35)] p-1" style={{ background: "rgba(250, 244, 234, 0.5)" }}>
        <Link
          href="/dashboard/admin"
          className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-[rgba(200,175,140,0.2)]"
          style={{ color: "hsl(24 12% 20%)" }}
        >
          Overview
        </Link>
        <Link
          href="/dashboard/admin/users"
          className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-[rgba(200,175,140,0.2)]"
          style={{ color: "hsl(24 12% 20%)" }}
        >
          Users
        </Link>
        <Link
          href="/dashboard/admin/events"
          className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-[rgba(200,175,140,0.2)]"
          style={{ color: "hsl(24 12% 20%)" }}
        >
          Events
        </Link>
      </nav>
      {children}
    </div>
  );
}
