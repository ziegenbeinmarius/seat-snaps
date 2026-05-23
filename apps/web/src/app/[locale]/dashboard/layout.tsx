import React from "react";
import { requireAuth } from "@/lib/require-auth";
import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { APP_BACKGROUND } from "@/lib/event-helpers";
import { CreditBalanceBadge } from "@/components/credits/credit-balance-badge";
import { TrialWelcomeDialog } from "@/components/credits/trial-welcome-dialog";
import { SettingsDropdown } from "@/components/settings-dropdown";
import type { CreditBalanceResponse } from "@seat-snaps/shared";
import { setRequestLocale } from "next-intl/server";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await requireAuth();

  try {
    const credits = await apiRequest<CreditBalanceResponse>("/credits");
    if (credits.totalCredits === 0 && !credits.freeTrialUsed) {
      redirect("/select-plan");
    }
  } catch {
    // If credits can't be fetched, allow access rather than blocking
  }

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
            <CreditBalanceBadge />
            <SettingsDropdown
              userName={session.user?.name}
              isAdmin={session.user?.isAdmin ?? false}
              showProfile
              profileHref="/dashboard/profile"
              showSignOut
            />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      <TrialWelcomeDialog />
    </div>
  );
}
