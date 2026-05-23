"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Get Event Credits</DialogTitle>
        </DialogHeader>

        {credits && !credits.freeTrialUsed && (
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
                  style={{ borderColor: "hsl(33 18% 85%)" }}
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
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {credits && (
          <p className="text-center text-xs" style={{ color: "hsl(28 8% 50%)" }}>
            Current balance: {credits.availableCredits} credit
            {credits.availableCredits !== 1 ? "s" : ""}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
