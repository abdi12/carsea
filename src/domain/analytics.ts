// Product-health measures (SPEC §2). Each is a named action that is only
// ever counted: per event, per day. No identifier, address, answer, car id,
// or free text is part of an event, so there is nothing to profile.

export const usageEvents = [
  "finder_start",
  "finder_complete",
  "recommendation_to_detail",
  "compare_add",
  "compare_remove",
  "comparison_viewed",
  "guide_view",
  "methodology_view",
  "service_search",
] as const;

export type UsageEvent = (typeof usageEvents)[number];

export const isUsageEvent = (value: unknown): value is UsageEvent =>
  typeof value === "string" && (usageEvents as readonly string[]).includes(value);
