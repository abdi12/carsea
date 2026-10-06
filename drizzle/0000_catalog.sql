CREATE TABLE "energy_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"region" text NOT NULL,
	"energy_type" text NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"price_per_unit" double precision NOT NULL,
	"unit" text NOT NULL,
	"valid_from" date NOT NULL,
	"source_id" text NOT NULL,
	"verified_on" date NOT NULL,
	CONSTRAINT "energy_prices_region_type_from" UNIQUE("region","energy_type","valid_from"),
	CONSTRAINT "energy_prices_positive" CHECK ("energy_prices"."price_per_unit" > 0)
);
--> statement-breakpoint
CREATE TABLE "import_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"directory" text NOT NULL,
	"dry_run" boolean NOT NULL,
	"rows_read" integer NOT NULL,
	"rows_accepted" integer NOT NULL,
	"rows_rejected" integer NOT NULL,
	"report" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "makes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "models" (
	"id" text PRIMARY KEY NOT NULL,
	"make_id" text NOT NULL,
	"name" text NOT NULL,
	"body_style" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"variant_id" text NOT NULL,
	"region" text NOT NULL,
	"price_type" text DEFAULT 'otr' NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"amount" bigint NOT NULL,
	"valid_from" date NOT NULL,
	"valid_until" date,
	"inclusions_note" text,
	"source_id" text NOT NULL,
	"verified_on" date NOT NULL,
	CONSTRAINT "prices_variant_region_from" UNIQUE("variant_id","region","price_type","valid_from"),
	CONSTRAINT "prices_amount_positive" CHECK ("prices"."amount" > 0),
	CONSTRAINT "prices_validity_order" CHECK ("prices"."valid_until" is null or "prices"."valid_until" >= "prices"."valid_from")
);
--> statement-breakpoint
CREATE TABLE "service_centers" (
	"id" text PRIMARY KEY NOT NULL,
	"make_id" text NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"region" text NOT NULL,
	"phone" text,
	"opening_hours" text,
	"latitude" double precision,
	"longitude" double precision,
	"source_id" text NOT NULL,
	"verified_on" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"publisher" text NOT NULL,
	"url" text,
	"retrieved_on" date NOT NULL,
	"license_note" text
);
--> statement-breakpoint
CREATE TABLE "variant_facts" (
	"variant_id" text NOT NULL,
	"key" text NOT NULL,
	"value_number" double precision,
	"value_text" text,
	"unit" text NOT NULL,
	"source_id" text NOT NULL,
	"verified_on" date NOT NULL,
	CONSTRAINT "variant_facts_key" UNIQUE("variant_id","key"),
	CONSTRAINT "variant_facts_one_value" CHECK (("variant_facts"."value_number" is null) <> ("variant_facts"."value_text" is null))
);
--> statement-breakpoint
CREATE TABLE "variant_features" (
	"variant_id" text NOT NULL,
	"feature_key" text NOT NULL,
	"availability" text NOT NULL,
	"source_id" text NOT NULL,
	"verified_on" date NOT NULL,
	CONSTRAINT "variant_features_key" UNIQUE("variant_id","feature_key")
);
--> statement-breakpoint
CREATE TABLE "variant_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"variant_id" text NOT NULL,
	"path" text NOT NULL,
	"alt_id" text NOT NULL,
	"alt_en" text NOT NULL,
	"license" text NOT NULL,
	"attribution" text,
	"source_id" text NOT NULL,
	"verified_on" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "variants" (
	"id" text PRIMARY KEY NOT NULL,
	"model_id" text NOT NULL,
	"model_year" integer NOT NULL,
	"trim" text NOT NULL,
	"powertrain" text NOT NULL,
	"transmission" text NOT NULL,
	"publication_status" text DEFAULT 'draft' NOT NULL,
	"source_id" text NOT NULL,
	"verified_on" date NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "variants_identity" UNIQUE("model_id","model_year","trim","powertrain","transmission")
);
--> statement-breakpoint
CREATE TABLE "warranties" (
	"variant_id" text NOT NULL,
	"coverage" text NOT NULL,
	"years" integer,
	"distance_km" integer,
	"conditions" text,
	"source_id" text NOT NULL,
	"verified_on" date NOT NULL,
	CONSTRAINT "warranties_coverage" UNIQUE("variant_id","coverage"),
	CONSTRAINT "warranties_has_limit" CHECK ("warranties"."years" is not null or "warranties"."distance_km" is not null)
);
--> statement-breakpoint
ALTER TABLE "energy_prices" ADD CONSTRAINT "energy_prices_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "models" ADD CONSTRAINT "models_make_id_makes_id_fk" FOREIGN KEY ("make_id") REFERENCES "public"."makes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prices" ADD CONSTRAINT "prices_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prices" ADD CONSTRAINT "prices_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_centers" ADD CONSTRAINT "service_centers_make_id_makes_id_fk" FOREIGN KEY ("make_id") REFERENCES "public"."makes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_centers" ADD CONSTRAINT "service_centers_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_facts" ADD CONSTRAINT "variant_facts_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_facts" ADD CONSTRAINT "variant_facts_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_features" ADD CONSTRAINT "variant_features_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_features" ADD CONSTRAINT "variant_features_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_images" ADD CONSTRAINT "variant_images_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_images" ADD CONSTRAINT "variant_images_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "service_centers_make_region" ON "service_centers" USING btree ("make_id","region");--> statement-breakpoint
CREATE INDEX "variants_model" ON "variants" USING btree ("model_id");