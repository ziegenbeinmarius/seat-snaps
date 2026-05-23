import type { Metadata } from "next";
import { redirect } from "@/i18n/navigation";
import { requireAuth } from "@/lib/require-auth";
import { apiRequest } from "@/lib/api";
import type { PricingTierResponse } from "@seat-snaps/shared";
import { CheckoutClient } from "./checkout-client";

export const metadata: Metadata = { title: "Checkout — SeatSnaps" };

interface Props {
  searchParams: Promise<{ tierId?: string }>;
}

export default async function CheckoutPage({ searchParams }: Props) {
  await requireAuth();

  const { tierId } = await searchParams;

  if (!tierId) {
    redirect("/select-plan");
  }

  let tier: PricingTierResponse | null = null;
  try {
    const tiers = await apiRequest<PricingTierResponse[]>("/payments/tiers");
    tier = tiers.find((t) => t.id === tierId) ?? null;
  } catch {
    // Tier fetch failed
  }

  if (!tier) {
    redirect("/select-plan");
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background: "linear-gradient(160deg, #f5ede0 0%, #f0e6d4 40%, #ede0cc 100%)",
      }}
    >
      <div className="w-full max-w-md space-y-8">
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
            Confirm your purchase
          </p>
        </div>

        <CheckoutClient tier={tier} />
      </div>
    </main>
  );
}
