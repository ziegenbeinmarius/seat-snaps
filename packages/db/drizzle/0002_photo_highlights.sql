ALTER TABLE "photos" ADD COLUMN "is_highlight" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN "highlight_order" integer;
