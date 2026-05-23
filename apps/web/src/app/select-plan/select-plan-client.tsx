"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClaimTrial } from "@/lib/api/credits";
import { useCheckout } from "@/lib/api/payments";
import type { PricingTierResponse } from "@seat-snaps/shared";

interface Props {
  tiers: PricingTierResponse[];
}

export function SelectPlanClient({ tiers }: Props) {
  const router = useRouter();
  const claimTrial = useClaimTrial();
  const checkout = useCheckout();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleTrialSelect = async () => {
    setProcessingId("trial");
    try {
      await claimTrial.mutateAsync();
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Failed to claim trial", err);
      setProcessingId(null);
    }
  };

  const handleTierSelect = async (tierId: string) => {
    setProcessingId(tierId);
    try {
      await checkout.mutateAsync({ tierId });
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Failed to checkout", err);
      setProcessingId(null);
    }
  };

  const isProcessing = processingId !== null;

  return (
    <div className="space-y-4">
      {/* Free Trial Card */}
      <div
        className="relative rounded-2xl p-6 flex items-start justify-between gap-4"
        style={{
          background: "rgba(250, 244, 234, 0.85)",
          border: "2px solid hsl(28 65% 60%)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* "Most popular for starters" badge */}
        <span
          className="absolute -top-3 left-6 rounded-full px-3 py-0.5 text-xs font-semibold"
          style={{ background: "hsl(28 65% 44%)", color: "white" }}
        >
          Try for free
        </span>

        <div className="flex items-start gap-4 flex-1">
          <div
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ background: "hsl(33 40% 92%)" }}
          >
            <Sparkles className="h-5 w-5" style={{ color: "hsl(28 65% 44%)" }} />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-lg" style={{ color: "hsl(24 12% 20%)" }}>
              Free Trial
            </p>
            <ul className="space-y-1">
              {[
                "1 event",
                "Up to 5 attendees",
                "All features included",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm" style={{ color: "hsl(28 8% 40%)" }}>
                  <Check className="h-3.5 w-3.5 shrink-0" style={{ color: "hsl(142 40% 45%)" }} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <span className="text-2xl font-bold" style={{ color: "hsl(24 12% 20%)" }}>
            Free
          </span>
          <Button
            onClick={handleTrialSelect}
            disabled={isProcessing}
            style={{ background: "hsl(28 65% 44%)", color: "white" }}
            className="hover:opacity-90"
          >
            {processingId === "trial" ? "Starting…" : "Start free trial"}
          </Button>
        </div>
      </div>

      {/* Paid Tier Cards */}
      {tiers.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="rounded-2xl p-5 flex flex-col justify-between gap-4"
              style={{
                background: "rgba(250, 244, 234, 0.7)",
                border: "1px solid hsl(33 18% 82%)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="space-y-1">
                <p className="font-semibold text-base" style={{ color: "hsl(24 12% 20%)" }}>
                  {tier.name}
                </p>
                <p className="text-sm" style={{ color: "hsl(28 8% 50%)" }}>
                  {tier.eventCount} event{tier.eventCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-xl font-bold" style={{ color: "hsl(24 12% 20%)" }}>
                  {tier.priceSek}{" "}
                  <span className="text-sm font-normal" style={{ color: "hsl(28 8% 50%)" }}>
                    {tier.currency}
                  </span>
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  style={{ borderColor: "hsl(33 18% 75%)", color: "hsl(24 12% 20%)" }}
                  disabled={isProcessing}
                  onClick={() => handleTierSelect(tier.id)}
                >
                  {processingId === tier.id ? "Processing…" : "Choose"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-xs" style={{ color: "hsl(28 8% 52%)" }}>
        No real payment is processed. All plans are immediately activated.
      </p>
    </div>
  );
}
