import { describe, expect, it } from "vitest";

import { type MatchCandidate, type Reason, matchCars } from "./matching";

const car = (variantId: string, overrides: Partial<MatchCandidate> = {}): MatchCandidate => ({
  variantId,
  makeId: "make-a",
  bodyStyle: "suv",
  powertrain: "petrol",
  priceAmount: 300_000_000,
  seats: 5,
  lengthMm: 4400,
  cargoVolumeL: 400,
  groundClearanceMm: 190,
  monthlyEnergyCost: 600_000,
  standardFeatures: { safety: 5, comfort: 3, infotainment: 2, practicality: 1 },
  warrantyYears: 3,
  ...overrides,
});

const ids = (result: ReturnType<typeof matchCars>) => result.matches.map((m) => m.variantId);
const reason = (result: ReturnType<typeof matchCars>, id: string, code: Reason["code"]) =>
  result.matches.find((m) => m.variantId === id)!.reasons.find((r) => r.code === code)!;

describe("matchCars: exclusions", () => {
  it("drops cars over budget, with too few seats, or without a current price", () => {
    const result = matchCars(
      [
        car("ok"),
        car("pricey", { priceAmount: 400_000_000 }),
        car("small", { seats: 4 }),
        car("no-price", { priceAmount: null }),
      ],
      { budgetMax: 350_000_000, minSeats: 5 },
    );
    expect(ids(result)).toEqual(["ok"]);
    expect(result.excluded).toEqual([
      { variantId: "pricey", reason: "over_budget" },
      { variantId: "small", reason: "too_few_seats" },
      { variantId: "no-price", reason: "no_current_price" },
    ]);
  });

  it("keeps a car at exactly the budget", () => {
    expect(ids(matchCars([car("edge", { priceAmount: 350_000_000 })], { budgetMax: 350_000_000 }))).toEqual(["edge"]);
  });

  it("does not treat an unknown seat count as too few", () => {
    const result = matchCars([car("unknown-seats", { seats: null })], { minSeats: 7 });
    expect(ids(result)).toEqual(["unknown-seats"]);
    expect(reason(result, "unknown-seats", "seats").outcome).toBe("unknown");
    expect(result.evidenceMissing).toBe(true);
  });
});

describe("matchCars: reasons", () => {
  it("only reports reasons for answers the buyer gave", () => {
    expect(matchCars([car("a")], {}).matches[0].reasons).toEqual([]);
  });

  it("marks an unwanted powertrain as unmet rather than excluding the car", () => {
    const result = matchCars([car("petrol"), car("ev", { powertrain: "electric" })], {
      powertrains: ["electric"],
    });
    expect(ids(result)).toEqual(["ev", "petrol"]);
    expect(reason(result, "petrol", "powertrain").outcome).toBe("unmet");
  });

  it("compares priorities against the median of eligible cars", () => {
    const result = matchCars(
      [
        car("cheap-to-run", { monthlyEnergyCost: 300_000 }),
        car("middle", { monthlyEnergyCost: 600_000 }),
        car("thirsty", { monthlyEnergyCost: 900_000 }),
      ],
      { priorities: ["low_running_cost"] },
    );
    expect(reason(result, "cheap-to-run", "priority_low_running_cost").outcome).toBe("met");
    expect(reason(result, "middle", "priority_low_running_cost").outcome).toBe("met");
    expect(reason(result, "thirsty", "priority_low_running_cost").outcome).toBe("unmet");
  });

  it("leaves over-budget cars out of the comparison pool", () => {
    // Without the exclusion the median would be 600k and "b" would be unmet.
    const result = matchCars(
      [
        car("a", { monthlyEnergyCost: 500_000 }),
        car("b", { monthlyEnergyCost: 700_000 }),
        car("out", { monthlyEnergyCost: 100_000, priceAmount: 900_000_000 }),
        car("out2", { monthlyEnergyCost: 100_000, priceAmount: 900_000_000 }),
      ],
      { budgetMax: 350_000_000, priorities: ["low_running_cost"] },
    );
    expect(reason(result, "a", "priority_low_running_cost").outcome).toBe("met");
    expect(reason(result, "b", "priority_low_running_cost").outcome).toBe("unmet");
  });

  it("says unknown when the data is missing, never met or unmet", () => {
    const result = matchCars(
      [car("known"), car("known2"), car("no-features", { standardFeatures: null })],
      { priorities: ["safety"] },
    );
    expect(reason(result, "no-features", "priority_safety").outcome).toBe("unknown");
    expect(result.evidenceMissing).toBe(true);
  });

  it("says unknown when there is nothing to compare against", () => {
    const result = matchCars([car("only")], { priorities: ["warranty"] });
    expect(reason(result, "only", "priority_warranty").outcome).toBe("unknown");
  });

  it("uses at most three priorities and ignores duplicates", () => {
    const result = matchCars([car("a"), car("b")], {
      priorities: ["safety", "safety", "comfort", "space", "warranty"],
    });
    expect(result.matches[0].reasons.map((r) => r.code)).toEqual([
      "priority_safety",
      "priority_comfort",
      "priority_space",
    ]);
  });
});

describe("matchCars: ordering", () => {
  it("puts fewer unmet preferences first", () => {
    const result = matchCars(
      [car("wrong-body", { bodyStyle: "sedan", priceAmount: 100_000_000 }), car("right-body")],
      { bodyStyles: ["suv"] },
    );
    expect(ids(result)).toEqual(["right-body", "wrong-body"]);
  });

  it("then more of the buyer's priorities met", () => {
    const result = matchCars(
      [
        car("short-warranty", { warrantyYears: 3, priceAmount: 100_000_000 }),
        car("long-warranty", { warrantyYears: 5 }),
        car("long-warranty-2", { warrantyYears: 5 }),
      ],
      { priorities: ["warranty"] },
    );
    expect(ids(result)[2]).toBe("short-warranty");
  });

  it("then fewer unknowns, then lower price, then id", () => {
    const result = matchCars(
      [
        car("c", { priceAmount: 300_000_000 }),
        car("b", { priceAmount: 300_000_000 }),
        car("cheaper", { priceAmount: 250_000_000 }),
        car("unknown", { priceAmount: 100_000_000, seats: null }),
      ],
      { minSeats: 5 },
    );
    expect(ids(result)).toEqual(["cheaper", "b", "c", "unknown"]);
  });

  it("is unaffected by the make or by the order cars arrive in", () => {
    const cars = [
      car("a", { makeId: "make-a", priceAmount: 310_000_000 }),
      car("b", { makeId: "make-b", priceAmount: 300_000_000 }),
      car("c", { makeId: "make-c", priceAmount: 320_000_000 }),
    ];
    const swapped = cars.map((c, i) => ({ ...c, makeId: ["make-z", "make-y", "make-x"][i] }));
    const expected = ids(matchCars(cars, { budgetMax: 400_000_000 }));
    expect(ids(matchCars([...cars].reverse(), { budgetMax: 400_000_000 }))).toEqual(expected);
    expect(ids(matchCars(swapped, { budgetMax: 400_000_000 }))).toEqual(expected);
  });
});

describe("matchCars: shortlist size", () => {
  it("returns at most five matches", () => {
    const result = matchCars(
      Array.from({ length: 8 }, (_, i) => car(`car-${i}`)),
      {},
    );
    expect(result.matches).toHaveLength(5);
    expect(result.limited).toBe(false);
  });

  it("flags a shortlist below three as limited", () => {
    expect(matchCars([car("a"), car("b")], {}).limited).toBe(true);
    expect(matchCars([], {})).toMatchObject({ matches: [], limited: true });
  });
});
