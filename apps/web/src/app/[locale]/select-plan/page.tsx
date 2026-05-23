import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/require-auth";
import { apiRequest } from "@/lib/api";
import type { CreditBalanceResponse, PricingTierResponse } from "@seat-snaps/shared";
import { SelectPlanClient } from "./select-plan-client";

export const metadata: Metadata = { title: "Choose your plan — SeatSnaps" };

export default async function SelectPlanPage() {
  await requireAuth();

  // If the user already has credits (returning user or already chose a plan), skip to dashboard
  let credits: CreditBalanceResponse | null = null;
  try {
    credits = await apiRequest<CreditBalanceResponse>("/credits");
  } catch {
    // If we can't fetch credits, just show the page
  }

  if (credits && (credits.totalCredits > 0 || credits.freeTrialUsed)) {
    redirect("/dashboard");
  }

  let tiers: PricingTierResponse[] = [];
  try {
    tiers = await apiRequest<PricingTierResponse[]>("/payments/tiers");
  } catch {
    // If tiers can't be loaded, we still show the free trial option
  }

  // Sort by eventCount ascending
  const sortedTiers = [...tiers].sort((a, b) => a.eventCount - b.eventCount);

  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background: "linear-gradient(160deg, #f5ede0 0%, #f0e6d4 40%, #ede0cc 100%)",
      }}
    >
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1
            className="text-4xl font-semibold tracking-tight"
            style={{
              fontFamily: "var(--font-cormorant, Georgia, serif)",
              color: "hsl(24 12% 20%)",
            }}
          >
            SeatSnaps
          </h1>
          <p
            className="text-2xl font-medium"
            style={{ color: "hsl(24 12% 20%)" }}
          >
            Choose your plan
          </p>
          <p className="text-sm" style={{ color: "hsl(28 8% 52%)" }}>
            Get started with a free trial or pick a plan that fits your needs.
          </p>
        </div>

        <SelectPlanClient tiers={sortedTiers} />
      </div>
    </main>
  );
}
