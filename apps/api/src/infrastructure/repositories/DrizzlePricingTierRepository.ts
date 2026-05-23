import { eq } from "@seat-snaps/db";
import type { Database, PricingTier } from "@seat-snaps/db";
import { pricingTiers } from "@seat-snaps/db";
import type { IPricingTierRepository } from "../../domain/repositories/IPricingTierRepository";

export class DrizzlePricingTierRepository implements IPricingTierRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<PricingTier | null> {
    const result = await this.db
      .select()
      .from(pricingTiers)
      .where(eq(pricingTiers.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findAllActive(): Promise<PricingTier[]> {
    return this.db
      .select()
      .from(pricingTiers)
      .where(eq(pricingTiers.active, true));
  }
}
