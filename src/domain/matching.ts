import type { BodyStyle, FeatureCategory, Powertrain } from "./catalog";

// Explainable, rules-based matching (SPEC §7).
//
// There is no numeric fit score. Each candidate gets a list of reasons,
// every one of them met, unmet, or unknown, and candidates are ordered by a
// fixed, documented comparison of those reasons. Nothing about a make,
// dealer, or commercial relationship is an input, so none can affect order.
// Reasons are codes with parameters; the interface turns them into words.

export const MAX_MATCHES = 5;
export const MIN_MATCHES = 3;
export const MAX_PRIORITIES = 3;

export const uses = ["city", "family_trips", "rough_roads"] as const;
export type Use = (typeof uses)[number];

export const priorities = [
  "low_running_cost",
  "safety",
  "comfort",
  "space",
  "warranty",
] as const;
export type Priority = (typeof priorities)[number];

export interface BuyerAnswers {
  /** Highest acceptable on-the-road price, in rupiah. */
  budgetMax?: number;
  minSeats?: number;
  powertrains?: Powertrain[];
  bodyStyles?: BodyStyle[];
  uses?: Use[];
  /** At most `MAX_PRIORITIES`; extra entries are ignored. */
  priorities?: Priority[];
}

/** What matching needs to know about one variant. `null` means not known. */
export interface MatchCandidate {
  variantId: string;
  makeId: string;
  bodyStyle: BodyStyle;
  powertrain: Powertrain;
  /** A current price only. Stale or expired prices are passed as null. */
  priceAmount: number | null;
  seats: number | null;
  lengthMm: number | null;
  cargoVolumeL: number | null;
  groundClearanceMm: number | null;
  /** Monthly fuel or electricity estimate at the buyer's distance. */
  monthlyEnergyCost: number | null;
  /** Verified standard features per category; null when none are recorded. */
  standardFeatures: Record<FeatureCategory, number> | null;
  warrantyYears: number | null;
}

export type ReasonCode =
  | "within_budget"
  | "seats"
  | "powertrain"
  | "body_style"
  | `use_${Use}`
  | `priority_${Priority}`;

export interface Reason {
  code: ReasonCode;
  outcome: "met" | "unmet" | "unknown";
  /** True for reasons that come from a buyer-selected priority. */
  priority: boolean;
}

export type ExclusionReason = "no_current_price" | "over_budget" | "too_few_seats";

export interface Match {
  variantId: string;
  reasons: Reason[];
}

export interface MatchResult {
  matches: Match[];
  /** True when fewer than `MIN_MATCHES` cars could be recommended. */
  limited: boolean;
  /** True when any shown match has a reason that could not be assessed. */
  evidenceMissing: boolean;
  excluded: { variantId: string; reason: ExclusionReason }[];
}

const outcome = (met: boolean | null): Reason["outcome"] =>
  met === null ? "unknown" : met ? "met" : "unmet";

function median(values: number[]): number | null {
  if (values.length < 2) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Relative rules compare a car with the median of the other cars that
 * passed the buyer's hard requirements, e.g. "running cost at or below the
 * median of cars in your budget". With fewer than two known values there is
 * nothing to compare against, so the answer is unknown, not a guess.
 */
function relativeRule(
  pool: MatchCandidate[],
  read: (c: MatchCandidate) => number | null,
  better: "lower" | "higher",
) {
  const mid = median(pool.map(read).filter((v): v is number => v !== null));
  return (candidate: MatchCandidate): boolean | null => {
    const value = read(candidate);
    if (value === null || mid === null) return null;
    return better === "lower" ? value <= mid : value >= mid;
  };
}

function exclusion(c: MatchCandidate, answers: BuyerAnswers): ExclusionReason | null {
  // A car without a current price cannot be recommended (SPEC §8).
  if (c.priceAmount === null) return "no_current_price";
  if (answers.budgetMax !== undefined && c.priceAmount > answers.budgetMax) return "over_budget";
  // Unknown seat count is not treated as too few; it is reported as unknown.
  if (answers.minSeats !== undefined && c.seats !== null && c.seats < answers.minSeats) {
    return "too_few_seats";
  }
  return null;
}

export function matchCars(candidates: MatchCandidate[], answers: BuyerAnswers): MatchResult {
  const excluded: MatchResult["excluded"] = [];
  const pool: MatchCandidate[] = [];
  for (const candidate of candidates) {
    const reason = exclusion(candidate, answers);
    if (reason) excluded.push({ variantId: candidate.variantId, reason });
    else pool.push(candidate);
  }

  const featureCount = (category: FeatureCategory) => (c: MatchCandidate) =>
    c.standardFeatures ? c.standardFeatures[category] : null;

  const useRules: Record<Use, (c: MatchCandidate) => boolean | null> = {
    city: relativeRule(pool, (c) => c.lengthMm, "lower"),
    family_trips: relativeRule(pool, (c) => c.cargoVolumeL, "higher"),
    rough_roads: relativeRule(pool, (c) => c.groundClearanceMm, "higher"),
  };
  const priorityRules: Record<Priority, (c: MatchCandidate) => boolean | null> = {
    low_running_cost: relativeRule(pool, (c) => c.monthlyEnergyCost, "lower"),
    safety: relativeRule(pool, featureCount("safety"), "higher"),
    comfort: relativeRule(pool, featureCount("comfort"), "higher"),
    space: relativeRule(pool, (c) => c.cargoVolumeL, "higher"),
    warranty: relativeRule(pool, (c) => c.warrantyYears, "higher"),
  };

  const chosenUses = [...new Set(answers.uses ?? [])];
  const chosenPriorities = [...new Set(answers.priorities ?? [])].slice(0, MAX_PRIORITIES);

  const scored = pool.map((c) => {
    const reasons: Reason[] = [];
    const add = (code: ReasonCode, met: boolean | null, priority = false) =>
      reasons.push({ code, outcome: outcome(met), priority });

    if (answers.budgetMax !== undefined) add("within_budget", true);
    if (answers.minSeats !== undefined) add("seats", c.seats === null ? null : true);
    if (answers.powertrains?.length) add("powertrain", answers.powertrains.includes(c.powertrain));
    if (answers.bodyStyles?.length) add("body_style", answers.bodyStyles.includes(c.bodyStyle));
    for (const use of chosenUses) add(`use_${use}`, useRules[use](c));
    for (const priority of chosenPriorities) {
      add(`priority_${priority}`, priorityRules[priority](c), true);
    }

    const count = (o: Reason["outcome"], priorityOnly = false) =>
      reasons.filter((r) => r.outcome === o && (!priorityOnly || r.priority)).length;

    return {
      candidate: c,
      reasons,
      unmet: count("unmet"),
      prioritiesMet: count("met", true),
      unknown: count("unknown"),
    };
  });

  // The whole ordering, in order of precedence:
  //   1. fewer unmet preferences
  //   2. more of the buyer's own priorities met
  //   3. fewer reasons that could not be assessed
  //   4. lower price
  //   5. variant id, only to keep the order stable
  scored.sort(
    (a, b) =>
      a.unmet - b.unmet ||
      b.prioritiesMet - a.prioritiesMet ||
      a.unknown - b.unknown ||
      (a.candidate.priceAmount ?? 0) - (b.candidate.priceAmount ?? 0) ||
      a.candidate.variantId.localeCompare(b.candidate.variantId),
  );

  const top = scored.slice(0, MAX_MATCHES);
  return {
    matches: top.map(({ candidate, reasons }) => ({ variantId: candidate.variantId, reasons })),
    limited: top.length < MIN_MATCHES,
    evidenceMissing: top.some((s) => s.unknown > 0),
    excluded,
  };
}
