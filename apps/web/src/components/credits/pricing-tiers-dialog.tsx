"use client";

import React from "react";
import { useRouter } from "@/i18n/navigation";
import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePricingTiers } from "@/lib/api/payments";
import { useCredits } from "@/lib/api/credits";
import { useTranslations } from "next-intl";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PricingTiersDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const { data: tiers, isLoading } = usePricingTiers();
  const { data: credits } = useCredits();
  const t = useTranslations("credits");

  const handleBuy = (tierId: string) => {
    onOpenChange(false);
    router.push(`/checkout?tierId=${encodeURIComponent(tierId)}`);
  };

  const isExhausted = credits ? credits.availableCredits === 0 && credits.freeTrialUsed : false;
  const hasTrialAvailable = credits ? !credits.freeTrialUsed : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isExhausted ? t("outOfCredits") : t("getCredits")}</DialogTitle>
          {isExhausted && (
            <DialogDescription>
              {t("usedAllDesc")}
            </DialogDescription>
          )}
        </DialogHeader>

        {isExhausted && (
          <div
            className="flex items-start gap-3 rounded-lg px-4 py-3"
            style={{
              background: "hsl(0 72% 97%)",
              border: "1px solid hsl(0 60% 85%)",
            }}
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "hsl(0 65% 44%)" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "hsl(0 55% 35%)" }}>
                {t("zeroRemaining")}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "hsl(0 40% 45%)" }}>
                {t("trialUsedNoCredits")}
              </p>
            </div>
          </div>
        )}

        {hasTrialAvailable && (
          <div
            className="rounded-lg px-4 py-3 text-sm"
            style={{
              background: "hsl(142 40% 95%)",
              color: "hsl(142 40% 30%)",
              border: "1px solid hsl(142 30% 80%)",
            }}
          >
            {t("trialAvailable")}
          </div>
        )}

        {isLoading ? (
          <div className="py-8 text-center text-sm" style={{ color: "hsl(28 8% 50%)" }}>
            {t("loadingPlans")}
          </div>
        ) : (
          <div className="grid gap-3">
            {tiers
              ?.sort((a, b) => a.eventCount - b.eventCount)
              .map((tier) => (
                <div
                  key={tier.id}
                  className="flex items-center justify-between rounded-xl border px-5 py-4"
                  style={{ borderColor: isExhausted ? "hsl(28 40% 78%)" : "hsl(33 18% 85%)" }}
                >
                  <div>
                    <p className="font-semibold" style={{ color: "hsl(24 12% 20%)" }}>
                      {tier.name}
                    </p>
                    <p className="text-sm" style={{ color: "hsl(28 8% 50%)" }}>
                      {tier.eventCount !== 1 ? t("eventPlural", { count: tier.eventCount }) : t("event", { count: tier.eventCount })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold" style={{ color: "hsl(24 12% 20%)" }}>
                      {tier.priceSek} {tier.currency}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleBuy(tier.id)}
                      style={isExhausted ? { background: "hsl(28 65% 44%)", color: "white" } : undefined}
                    >
                      {t("buy")}
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {credits && (
          <p className="text-center text-xs" style={{ color: isExhausted ? "hsl(0 55% 45%)" : "hsl(28 8% 50%)" }}>
            {t("currentBalance")}{" "}
            <span className={isExhausted ? "font-semibold" : undefined}>
              {credits.availableCredits} {credits.availableCredits !== 1 ? t("creditPlural") : t("credit")}
            </span>
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
