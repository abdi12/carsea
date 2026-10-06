CREATE TABLE "usage_counts" (
	"day" date NOT NULL,
	"event" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "usage_counts_day_event_pk" PRIMARY KEY("day","event")
);
