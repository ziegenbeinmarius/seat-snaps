CREATE TYPE "public"."table_shape" AS ENUM('round', 'rectangular', 'long');--> statement-breakpoint
ALTER TABLE "tables" ADD COLUMN "shape" "table_shape" DEFAULT 'rectangular';--> statement-breakpoint
ALTER TABLE "tables" ADD COLUMN "rotation" real DEFAULT 0;--> statement-breakpoint
ALTER TABLE "tables" ADD COLUMN "width" real;--> statement-breakpoint
ALTER TABLE "tables" ADD COLUMN "height" real;