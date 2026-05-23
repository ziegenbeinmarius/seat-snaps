import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/require-auth";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireAuth();
  if (!session.user?.isAdmin) redirect("/dashboard");
  const t = await getTranslations("admin");

  return (
    <div className="space-y-6 px-4 py-8 max-w-7xl mx-auto">
      <div>
        <h1
          className="text-3xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "hsl(24 12% 20%)" }}
        >
          {t("title")}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "hsl(28 8% 50%)" }}>
          System administration and metrics
        </p>
      </div>
      <nav className="flex gap-1 rounded-lg border border-[rgba(200,175,140,0.35)] p-1" style={{ background: "rgba(250, 244, 234, 0.5)" }}>
        <Link
          href="/admin"
          className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-[rgba(200,175,140,0.2)]"
          style={{ color: "hsl(24 12% 20%)" }}
        >
          {t("overview")}
        </Link>
        <Link
          href="/admin/users"
          className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-[rgba(200,175,140,0.2)]"
          style={{ color: "hsl(24 12% 20%)" }}
        >
          {t("users")}
        </Link>
        <Link
          href="/admin/events"
          className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-[rgba(200,175,140,0.2)]"
          style={{ color: "hsl(24 12% 20%)" }}
        >
          {t("events")}
        </Link>
      </nav>
      {children}
    </div>
  );
}
