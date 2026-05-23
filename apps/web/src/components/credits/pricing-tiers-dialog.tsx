"use client";

import React from "react";
import { useRouter } from "@/i18n/navigation";
import { AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePricingTiers } from "@/lib/api/payments";
import { useCredits } from "@/lib/api/credits";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PricingTiersDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const { data: tiers, isLoading } = usePricingTiers();
  const { data: credits } = useCredits();

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
          <DialogTitle>{isExhausted ? "Out of Credits" : "Get Event Credits"}</DialogTitle>
          {isExhausted && (
            <DialogDescription>
              You&apos;ve used all your event credits. Buy a plan to keep creating events.
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Exhausted state banner */}
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
                0 credits remaining
              </p>
              <p className="text-xs mt-0.5" style={{ color: "hsl(0 40% 45%)" }}>
                Your free trial has been used and no paid credits are available.
              </p>
            </div>
          </div>
        )}

        {/* Free trial available banner */}
        {hasTrialAvailable && (
          <div
            className="rounded-lg px-4 py-3 text-sm"
            style={{
              background: "hsl(142 40% 95%)",
              color: "hsl(142 40% 30%)",
              border: "1px solid hsl(142 30% 80%)",
            }}
          >
            You have a free trial event available! Create your first event at no cost (max 5
            attendees).
          </div>
        )}

        {isLoading ? (
          <div className="py-8 text-center text-sm" style={{ color: "hsl(28 8% 50%)" }}>
            Loading plans...
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
                      {tier.eventCount} event{tier.eventCount !== 1 ? "s" : ""}
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
                      Buy
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {credits && (
          <p className="text-center text-xs" style={{ color: isExhausted ? "hsl(0 55% 45%)" : "hsl(28 8% 50%)" }}>
            Current balance:{" "}
            <span className={isExhausted ? "font-semibold" : undefined}>
              {credits.availableCredits} credit{credits.availableCredits !== 1 ? "s" : ""}
            </span>
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
