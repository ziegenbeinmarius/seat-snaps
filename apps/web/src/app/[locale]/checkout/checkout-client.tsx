"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { CheckCircle, Calendar, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCheckout } from "@/lib/api/payments";
import { useTranslations } from "next-intl";
import type { PricingTierResponse } from "@seat-snaps/shared";

interface Props {
  tier: PricingTierResponse;
}

export function CheckoutClient({ tier }: Props) {
  const router = useRouter();
  const checkout = useCheckout();
  const t = useTranslations("checkout");
  const [succeeded, setSucceeded] = useState(false);

  const handleConfirm = async () => {
    try {
      await checkout.mutateAsync({ tierId: tier.id });
      setSucceeded(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("purchaseFailed");
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4">
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
          {t("orderSummary")}
        </h2>

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
                {tier.eventCount !== 1 ? t("eventCreditsPlural", { count: tier.eventCount }) : t("eventCredits", { count: tier.eventCount })}
              </p>
              <p className="text-xs" style={{ color: "hsl(28 8% 52%)" }}>
                {t("useToCreate")}
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
                {t("simulatedPayment")}
              </p>
              <p className="text-xs" style={{ color: "hsl(28 8% 52%)" }}>
                {t("noRealCharge")}
              </p>
            </div>
          </div>
        </div>
      </div>

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
              {t("purchaseConfirmed")}
            </p>
            <p className="text-xs" style={{ color: "hsl(142 30% 40%)" }}>
              {tier.eventCount !== 1 ? t("creditsAddedPlural", { count: tier.eventCount }) : t("creditsAdded", { count: tier.eventCount })}
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
            {checkout.isPending ? t("processing") : t("confirmPurchase", { price: tier.priceSek, currency: tier.currency })}
          </Button>
          <Button
            variant="ghost"
            className="w-full text-sm"
            style={{ color: "hsl(28 8% 50%)" }}
            onClick={() => router.back()}
            disabled={checkout.isPending}
          >
            {t("goBack")}
          </Button>
        </div>
      )}

      <p className="text-center text-xs" style={{ color: "hsl(28 8% 56%)" }}>
        {t("noRealPayment")}
      </p>
    </div>
  );
}
