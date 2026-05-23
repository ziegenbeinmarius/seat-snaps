"use client";

import { useState } from "react";
import { Zap, X } from "lucide-react";
import { useCredits } from "@/lib/api/credits";
import { useTranslations } from "next-intl";
import { PricingTiersDialog } from "@/components/credits/pricing-tiers-dialog";

export function UpgradeBanner() {
  const { data: credits, isLoading } = useCredits();
  const [dismissed, setDismissed] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const t = useTranslations("credits");

  if (isLoading || dismissed) return null;
  if (!credits) return null;
  if (!credits.freeTrialUsed || credits.availableCredits > 0) return null;

  return (
    <>
      <div
        className="flex items-center justify-between gap-4 rounded-2xl px-5 py-3.5"
        style={{
          background: "rgba(250, 238, 220, 0.9)",
          border: "1px solid hsl(33 40% 78%)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ background: "hsl(28 65% 44%)", color: "white" }}
          >
            <Zap className="h-4 w-4" />
          </div>
          <p className="text-sm" style={{ color: "hsl(24 12% 25%)" }}>
            <span className="font-semibold">{t("outOfEventCredits")}</span>{" "}
            {t("upgradeToCreate")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPricing(true)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
            style={{ background: "hsl(28 65% 44%)", color: "white" }}
          >
            {t("upgradeBanner.cta")}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-black/5"
            style={{ color: "hsl(28 8% 50%)" }}
            aria-label={t("dismiss")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <PricingTiersDialog open={showPricing} onOpenChange={setShowPricing} />
    </>
  );
}
