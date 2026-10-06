import { type Powertrain, isOneOf, powertrains } from "./catalog";
import { type BuyerAnswers, MAX_PRIORITIES, type Priority, type Use, priorities, uses } from "./matching";
import { DEFAULT_MONTHLY_KM } from "./ownership-cost";

// The guided finder's questions and how its answers become matching input.
// Every question can be skipped; a skipped question adds no rule.

export const budgetOptions = ["under200", "200to350", "350to500", "over500"] as const;
export type BudgetOption = (typeof budgetOptions)[number];

/** Upper bound of each bracket in rupiah; the top bracket has none. */
export const budgetMax: Record<BudgetOption, number | undefined> = {
  under200: 200_000_000,
  "200to350": 350_000_000,
  "350to500": 500_000_000,
  over500: undefined,
};

export const seatOptions = ["five", "six_plus"] as const;
export type SeatOption = (typeof seatOptions)[number];
export const minSeats: Record<SeatOption, number> = { five: 5, six_plus: 6 };

export const MAX_MONTHLY_KM = 20_000;

export interface FinderAnswers {
  budget?: BudgetOption;
  seats?: SeatOption;
  uses?: Use[];
  powertrains?: Powertrain[];
  priorities?: Priority[];
  monthlyKm?: number;
}

export const finderSteps = ["budget", "seats", "uses", "powertrains", "priorities", "distance"] as const;
export type FinderStep = (typeof finderSteps)[number];

export const monthlyKmOf = (answers: FinderAnswers): number =>
  answers.monthlyKm ?? DEFAULT_MONTHLY_KM;

export const hasAnyAnswer = (answers: FinderAnswers): boolean => Object.keys(answers).length > 0;

export function toBuyerAnswers(answers: FinderAnswers): BuyerAnswers {
  return {
    budgetMax: answers.budget ? budgetMax[answers.budget] : undefined,
    minSeats: answers.seats ? minSeats[answers.seats] : undefined,
    uses: answers.uses,
    powertrains: answers.powertrains,
    priorities: answers.priorities,
  };
}

const list = <T extends string>(value: unknown, allowed: readonly T[], max = allowed.length) => {
  if (!Array.isArray(value)) return undefined;
  const kept = [...new Set(value.filter((v): v is T => typeof v === "string" && isOneOf(allowed, v)))];
  return kept.length ? kept.slice(0, max) : undefined;
};

/**
 * Rebuilds answers from whatever browser storage held. Storage is outside
 * our control, so anything unrecognised is dropped rather than trusted.
 */
export function parseFinderAnswers(value: unknown): FinderAnswers {
  if (typeof value !== "object" || value === null) return {};
  const raw = value as Record<string, unknown>;
  const answers: FinderAnswers = {};

  if (typeof raw.budget === "string" && isOneOf(budgetOptions, raw.budget)) answers.budget = raw.budget;
  if (typeof raw.seats === "string" && isOneOf(seatOptions, raw.seats)) answers.seats = raw.seats;
  const chosenUses = list(raw.uses, uses);
  if (chosenUses) answers.uses = chosenUses;
  const chosenPowertrains = list(raw.powertrains, powertrains);
  if (chosenPowertrains) answers.powertrains = chosenPowertrains;
  const chosenPriorities = list(raw.priorities, priorities, MAX_PRIORITIES);
  if (chosenPriorities) answers.priorities = chosenPriorities;
  if (
    typeof raw.monthlyKm === "number" &&
    Number.isFinite(raw.monthlyKm) &&
    raw.monthlyKm >= 0 &&
    raw.monthlyKm <= MAX_MONTHLY_KM
  ) {
    answers.monthlyKm = Math.round(raw.monthlyKm);
  }
  return answers;
}

/** Keeps only well-formed ids, without duplicates, up to `max`. */
export function parseIdList(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  const ids = value.filter(
    (v): v is string => typeof v === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v),
  );
  return [...new Set(ids)].slice(0, max);
}
