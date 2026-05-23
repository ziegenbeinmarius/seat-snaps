"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { CheckCircle, Calendar, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCheckout } from "@/lib/api/payments";
import type { PricingTierResponse } from "@seat-snaps/shared";

interface Props {
  tier: PricingTierResponse;
}

export function CheckoutClient({ tier }: Props) {
  const router = useRouter();
  const checkout = useCheckout();
  const [succeeded, setSucceeded] = useState(false);

  const handleConfirm = async () => {
    try {
      await checkout.mutateAsync({ tierId: tier.id });
      setSucceeded(true);
      // Brief success state before redirecting
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Purchase failed. Please try again.";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Order summary card */}
      <div
        className="rounded-2xl p-6 space-y-5"
        style={{
          background: "rgba(250, 244, 234, 0.85)",
          border: "1px solid hsl(33 18% 82%)",
          backdropFilter: "blur(12px)",
        }}
      >
        <h2
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "hsl(28 8% 52%)" }}
        >
          Order summary
        </h2>

        {/* Tier name */}
        <div className="flex items-center justify-between">
          <span
            className="text-lg font-semibold"
            style={{ color: "hsl(24 12% 20%)" }}
          >
            {tier.name}
          </span>
          <span
            className="text-xl font-bold"
            style={{ color: "hsl(24 12% 20%)" }}
          >
            {tier.priceSek}{" "}
            <span
              className="text-sm font-normal"
              style={{ color: "hsl(28 8% 50%)" }}
            >
              {tier.currency}
            </span>
          </span>
        </div>

        <div
          className="border-t"
          style={{ borderColor: "hsl(33 18% 88%)" }}
        />

        {/* Credits detail */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ background: "hsl(33 40% 92%)" }}
            >
              <Calendar className="h-4 w-4" style={{ color: "hsl(28 65% 44%)" }} />
            </div>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "hsl(24 12% 20%)" }}
              >
                {tier.eventCount} event credit{tier.eventCount !== 1 ? "s" : ""}
              </p>
              <p className="text-xs" style={{ color: "hsl(28 8% 52%)" }}>
                Use to create and manage events
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ background: "hsl(33 40% 92%)" }}
            >
              <CreditCard className="h-4 w-4" style={{ color: "hsl(28 65% 44%)" }} />
            </div>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "hsl(24 12% 20%)" }}
              >
                Simulated payment
              </p>
              <p className="text-xs" style={{ color: "hsl(28 8% 52%)" }}>
                No real charge — credits are granted immediately
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action area */}
      {succeeded ? (
        <div
          className="rounded-2xl p-5 flex items-center gap-3"
          style={{
            background: "hsl(142 40% 95%)",
            border: "1px solid hsl(142 30% 80%)",
          }}
        >
          <CheckCircle
            className="h-5 w-5 shrink-0"
            style={{ color: "hsl(142 40% 40%)" }}
          />
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "hsl(142 40% 30%)" }}
            >
              Purchase confirmed!
            </p>
            <p className="text-xs" style={{ color: "hsl(142 30% 40%)" }}>
              {tier.eventCount} credit{tier.eventCount !== 1 ? "s" : ""} added — redirecting to your dashboard…
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Button
            className="w-full"
            style={{ background: "hsl(28 65% 44%)", color: "white" }}
            onClick={handleConfirm}
            disabled={checkout.isPending}
          >
            {checkout.isPending ? "Processing…" : `Confirm Purchase — ${tier.priceSek} ${tier.currency}`}
          </Button>
          <Button
            variant="ghost"
            className="w-full text-sm"
            style={{ color: "hsl(28 8% 50%)" }}
            onClick={() => router.back()}
            disabled={checkout.isPending}
          >
            Go back
          </Button>
        </div>
      )}

      <p className="text-center text-xs" style={{ color: "hsl(28 8% 56%)" }}>
        No real payment is processed. All plans are immediately activated.
      </p>
    </div>
  );
}
