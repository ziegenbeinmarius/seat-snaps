import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const pricingTiers = pgTable("pricing_tiers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  eventCount: integer("event_count").notNull(),
  priceSek: integer("price_sek").notNull(),
  currency: text("currency").notNull().default("SEK"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PricingTier = typeof pricingTiers.$inferSelect;
export type NewPricingTier = typeof pricingTiers.$inferInsert;
