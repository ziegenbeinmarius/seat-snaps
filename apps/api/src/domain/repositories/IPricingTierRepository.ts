import type { PricingTier } from "@seat-snaps/db";

export interface IPricingTierRepository {
  findById(id: string): Promise<PricingTier | null>;
  findAllActive(): Promise<PricingTier[]>;
}

export const PRICING_TIER_REPOSITORY = Symbol("IPricingTierRepository");
