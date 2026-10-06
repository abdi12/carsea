import { describe, expect, it } from "vitest";

import { type CostInputs, type Sourced, estimateOwnershipCost } from "./ownership-cost";

const TODAY = "2026-10-06";
const src = <T,>(value: T, sourceId = "s1", verifiedOn = "2026-09-01"): Sourced<T> => ({
  value,
  sourceId,
  verifiedOn,
});

const petrol: CostInputs = {
  powertrain: "petrol",
  monthlyKm: 1000,
  fuelConsumptionKmPerL: src(20),
  energyType: src("petrol_ron92" as const),
  energyPrice: { ...src(12_000, "s2"), energyType: "petrol_ron92" },
  serviceCostAnnual: src(3_600_000),
  annualTax: src(4_800_000),
  insuranceAnnual: src(6_000_000),
};

const component = (inputs: CostInputs, key: string) =>
  estimateOwnershipCost(inputs, TODAY).components.find((c) => c.key === key)!;

describe("estimateOwnershipCost", () => {
  it("computes the four components separately", () => {
    const estimate = estimateOwnershipCost(petrol, TODAY);
    expect(estimate.components.map((c) => [c.key, c.monthly])).toEqual([
      ["energy", 600_000], // 1000 km / 20 km/l * Rp12,000
      ["servicing", 300_000],
      ["tax", 400_000],
      ["insurance", 500_000],
    ]);
    expect(estimate.subtotalMonthly).toBe(1_800_000);
    expect(estimate.complete).toBe(true);
    expect(estimate.unavailable).toEqual([]);
  });

  it("uses kWh per 100 km for electric cars", () => {
    const energy = component(
      {
        powertrain: "electric",
        monthlyKm: 1000,
        energyConsumptionKwhPer100Km: src(15),
        energyType: src("electricity_home" as const),
        energyPrice: { ...src(1_700), energyType: "electricity_home" },
      },
      "energy",
    );
    expect(energy.monthly).toBe(255_000); // 150 kWh * Rp1,700
  });

  it("scales energy with distance and nothing else", () => {
    const estimate = estimateOwnershipCost({ ...petrol, monthlyKm: 2000 }, TODAY);
    expect(estimate.components.map((c) => c.monthly)).toEqual([
      1_200_000, 300_000, 400_000, 500_000,
    ]);
  });

  it("reports a missing insurance figure instead of inventing one", () => {
    const estimate = estimateOwnershipCost({ ...petrol, insuranceAnnual: undefined }, TODAY);
    const insurance = estimate.components.find((c) => c.key === "insurance")!;
    expect(insurance.monthly).toBeNull();
    expect(insurance.missing).toEqual(["insurance_annual"]);
    expect(estimate.complete).toBe(false);
    expect(estimate.unavailable).toEqual(["insurance"]);
    // The subtotal covers only what is known.
    expect(estimate.subtotalMonthly).toBe(1_300_000);
  });

  it("names every missing energy input", () => {
    const energy = component({ powertrain: "petrol", monthlyKm: 1000 }, "energy");
    expect(energy.monthly).toBeNull();
    expect(energy.missing).toEqual(["consumption", "energy_type", "energy_price"]);
  });

  it("does not use a price for a different fuel grade", () => {
    const energy = component(
      { ...petrol, energyPrice: { ...src(13_500), energyType: "petrol_ron95" } },
      "energy",
    );
    expect(energy.monthly).toBeNull();
    expect(energy.missing).toEqual(["energy_price"]);
  });

  it("ignores the wrong consumption figure for the powertrain", () => {
    const energy = component(
      { ...petrol, powertrain: "electric", energyConsumptionKwhPer100Km: undefined },
      "energy",
    );
    expect(energy.monthly).toBeNull();
    expect(energy.missing).toContain("consumption");
  });

  it("rejects an energy type priced in the wrong unit for the powertrain", () => {
    const energy = component(
      {
        ...petrol,
        energyType: src("electricity_home" as const),
        energyPrice: { ...src(1_700), energyType: "electricity_home" },
      },
      "energy",
    );
    expect(energy.monthly).toBeNull();
    expect(energy.missing).toEqual(["energy_type"]);
  });

  it("flags a component built on an aged input as stale", () => {
    const energy = component(
      { ...petrol, energyPrice: { ...src(12_000, "s2", "2026-06-01"), energyType: "petrol_ron92" } },
      "energy",
    );
    expect(energy.monthly).toBe(600_000);
    expect(energy.stale).toBe(true);
    expect(component(petrol, "energy").stale).toBe(false);
  });

  it("lists each source once", () => {
    expect(component(petrol, "energy").sourceIds).toEqual(["s1", "s2"]);
  });

  it("rounds to whole rupiah", () => {
    expect(component({ ...petrol, annualTax: src(1_000_000) }, "tax").monthly).toBe(83_333);
  });

  it("handles zero distance and rejects invalid distance", () => {
    expect(component({ ...petrol, monthlyKm: 0 }, "energy").monthly).toBe(0);
    expect(() => estimateOwnershipCost({ ...petrol, monthlyKm: -1 }, TODAY)).toThrow(RangeError);
    expect(() => estimateOwnershipCost({ ...petrol, monthlyKm: NaN }, TODAY)).toThrow(RangeError);
  });
});
