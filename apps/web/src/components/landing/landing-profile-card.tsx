"use client";

import { Link } from "@/i18n/navigation";
import { LayoutDashboard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CreditBalanceResponse } from "@seat-snaps/shared";
import { useTranslations } from "next-intl";

interface LandingProfileCardProps {
  name: string;
  email: string;
  credits: CreditBalanceResponse | null;
}

export function LandingProfileCard({ name, email, credits }: LandingProfileCardProps) {
  const t = useTranslations("landing.profileCard");

  function getPlanLabel(): string {
    if (!credits) return t("loading");
    if (!credits.freeTrialUsed) return t("freeTrial");
    if (credits.totalCredits > 0) return t("paidPlan");
    return t("noActivePlan");
  }

  const available = credits?.availableCredits ?? 0;
  const planLabel = getPlanLabel();
  const isLow = credits ? available === 0 : false;

  return (
    <div
      data-animate="fade-up"
      className="landing-animate delay-300 w-full max-w-sm mx-auto rounded-2xl p-6 space-y-5"
      style={{
        background: "rgba(255, 252, 246, 0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(196, 149, 106, 0.25)",
        boxShadow: "0 8px 32px rgba(120, 80, 30, 0.12)",
      }}
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold"
          style={{ background: "hsl(28 65% 44%)", color: "white" }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold" style={{ color: "hsl(24 12% 20%)" }}>{name}</p>
          <p className="truncate text-sm" style={{ color: "hsl(28 8% 50%)" }}>{email}</p>
        </div>
      </div>

      {/* Plan + credits row */}
      <div className="flex items-center gap-3">
        <div
          className="flex-1 rounded-xl px-4 py-3 text-center"
          style={{ background: "hsl(33 18% 94%)" }}
        >
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "hsl(28 8% 50%)" }}>
            {t("plan")}
          </p>
          <p className="mt-0.5 text-sm font-semibold" style={{ color: "hsl(24 12% 20%)" }}>
            {planLabel}
          </p>
        </div>
        <div
          className="flex-1 rounded-xl px-4 py-3 text-center"
          style={{
            background: isLow ? "hsl(0 72% 97%)" : "hsl(33 18% 94%)",
          }}
        >
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "hsl(28 8% 50%)" }}>
            {t("credits")}
          </p>
          <p
            className="mt-0.5 text-sm font-semibold"
            style={{ color: isLow ? "hsl(0 65% 44%)" : "hsl(24 12% 20%)" }}
          >
            {credits !== null ? t("creditsLeft", { count: available }) : "—"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button size="sm" className="w-full justify-center gap-2" asChild>
          <Link href="/dashboard">
            <LayoutDashboard className="h-4 w-4" />
            {t("goToDashboard")}
          </Link>
        </Button>
        <Button size="sm" variant="outline" className="w-full justify-center gap-2" asChild>
          <Link href="/dashboard/profile">
            <User className="h-4 w-4" />
            {t("editProfile")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
