"use client";

import { useRouter } from "@/i18n/navigation";
import { Calendar, CreditCard, Zap, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/lib/api/credits";
import { usePricingTiers, usePaymentHistory } from "@/lib/api/payments";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlanManagementDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const { data: credits } = useCredits();
  const { data: tiers } = usePricingTiers();
  const { data: history } = usePaymentHistory();

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
          <DialogTitle>Plan &amp; Credits</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Credit balance card */}
          <div
            className="rounded-xl px-5 py-4 space-y-1"
            style={{
              background: isExhausted ? "hsl(0 72% 97%)" : "hsl(33 18% 96%)",
              border: `1px solid ${isExhausted ? "hsl(0 60% 85%)" : "hsl(33 18% 85%)"}`,
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: "hsl(28 8% 45%)" }}>
                Available credits
              </p>
              {isExhausted && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ background: "hsl(0 72% 92%)", color: "hsl(0 65% 40%)" }}
                >
                  Exhausted
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

          {/* Upgrade options */}
          {tiers && tiers.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(28 8% 50%)" }}>
                {isExhausted ? "Buy credits to continue" : "Buy more credits"}
              </p>
              <div className="grid gap-2">
                {tiers
                  .filter((t) => t.active)
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
                            {tier.eventCount} event{tier.eventCount !== 1 ? "s" : ""}
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

          {/* Purchase history */}
          {history && history.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(28 8% 50%)" }}>
                Purchase history
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
                          +{payment.creditsGranted} credit{payment.creditsGranted !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs" style={{ color: "hsl(28 8% 55%)" }}>
                          {new Date(payment.createdAt).toLocaleDateString("en-US", {
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
              No purchases yet.
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
                You&apos;ve used all your credits. Buy a plan above to create more events.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
