ALTER TABLE "product_assets" ADD COLUMN "data" "bytea";--> statement-breakpoint
ALTER TABLE "product_assets" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;