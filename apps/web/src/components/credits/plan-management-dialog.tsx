"use client";

import { useRouter } from "@/i18n/navigation";
import { Calendar, CreditCard, Zap, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCredits } from "@/lib/api/credits";
import { usePricingTiers, usePaymentHistory } from "@/lib/api/payments";
import { useTranslations, useLocale } from "next-intl";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlanManagementDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const { data: credits } = useCredits();
  const { data: tiers } = usePricingTiers();
  const { data: history } = usePaymentHistory();
  const t = useTranslations("credits");
  const locale = useLocale();

  const handleBuy = (tierId: string) => {
    onOpenChange(false);
    router.push(`/checkout?tierId=${encodeURIComponent(tierId)}`);
  };

  const available = credits?.availableCredits ?? 0;
  const total = credits?.totalCredits ?? 0;
  const isExhausted = available === 0 && (credits?.freeTrialUsed ?? false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("planAndCredits")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div
            className="rounded-xl px-5 py-4 space-y-1"
            style={{
              background: isExhausted ? "hsl(0 72% 97%)" : "hsl(33 18% 96%)",
              border: `1px solid ${isExhausted ? "hsl(0 60% 85%)" : "hsl(33 18% 85%)"}`,
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: "hsl(28 8% 45%)" }}>
                {t("availableCredits")}
              </p>
              {isExhausted && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ background: "hsl(0 72% 92%)", color: "hsl(0 65% 40%)" }}
                >
                  {t("exhausted")}
                </span>
              )}
            </div>
            <p
              className="text-3xl font-bold"
              style={{ color: isExhausted ? "hsl(0 65% 44%)" : "hsl(24 12% 20%)" }}
            >
              {available}
            </p>
            <p className="text-xs" style={{ color: "hsl(28 8% 55%)" }}>
              {total} total · {credits?.usedCredits ?? 0} used
            </p>
          </div>

          {tiers && tiers.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(28 8% 50%)" }}>
                {isExhausted ? t("buyCredits") : t("buyMoreCredits")}
              </p>
              <div className="grid gap-2">
                {tiers
                  .filter((tier) => tier.active)
                  .sort((a, b) => a.eventCount - b.eventCount)
                  .map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => handleBuy(tier.id)}
                      className="flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors hover:bg-[hsl(33_18%_96%)]"
                      style={{ borderColor: "hsl(33 18% 85%)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                          style={{ background: "hsl(33 40% 92%)" }}
                        >
                          <Calendar className="h-4 w-4" style={{ color: "hsl(28 65% 44%)" }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "hsl(24 12% 20%)" }}>
                            {tier.name}
                          </p>
                          <p className="text-xs" style={{ color: "hsl(28 8% 50%)" }}>
                            {tier.eventCount !== 1 ? t("eventPlural", { count: tier.eventCount }) : t("event", { count: tier.eventCount })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: "hsl(24 12% 20%)" }}>
                          {tier.priceSek} {tier.currency}
                        </span>
                        <ArrowRight className="h-4 w-4" style={{ color: "hsl(28 8% 55%)" }} />
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {history && history.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(28 8% 50%)" }}>
                {t("purchaseHistory")}
              </p>
              <div className="space-y-1.5">
                {history.slice(0, 5).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5"
                    style={{ background: "hsl(33 18% 97%)" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard
                        className="h-4 w-4 shrink-0"
                        style={{ color: "hsl(28 50% 55%)" }}
                      />
                      <div>
                        <p className="text-xs font-medium" style={{ color: "hsl(24 12% 25%)" }}>
                          +{payment.creditsGranted} {payment.creditsGranted !== 1 ? t("creditPlural") : t("credit")}
                        </p>
                        <p className="text-xs" style={{ color: "hsl(28 8% 55%)" }}>
                          {new Date(payment.createdAt).toLocaleDateString(locale, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium" style={{ color: "hsl(24 12% 30%)" }}>
                        {payment.amount} {payment.currency}
                      </span>
                      <span
                        className="rounded-full px-1.5 py-0.5 text-xs"
                        style={{
                          background:
                            payment.status === "completed"
                              ? "hsl(142 40% 92%)"
                              : "hsl(0 60% 92%)",
                          color:
                            payment.status === "completed"
                              ? "hsl(142 40% 32%)"
                              : "hsl(0 55% 40%)",
                        }}
                      >
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {history && history.length === 0 && (
            <p className="text-center text-xs" style={{ color: "hsl(28 8% 55%)" }}>
              {t("noPurchases")}
            </p>
          )}

          {isExhausted && (
            <div
              className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{
                background: "hsl(43 90% 95%)",
                border: "1px solid hsl(43 60% 80%)",
              }}
            >
              <Zap className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "hsl(38 80% 40%)" }} />
              <p className="text-xs" style={{ color: "hsl(38 50% 30%)" }}>
                {t("usedAllCredits")}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
