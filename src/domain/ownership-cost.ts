import { type EnergyType, type Powertrain, energyUnit } from "./catalog";
import { isStale } from "./provenance";

// The monthly ownership-cost estimate (SPEC §8).
//
// Four components, always reported separately. The one-time purchase price
// is never part of it, and neither are loan costs, depreciation, or resale.
// A component whose inputs are missing is reported as unavailable; it is
// never guessed, and the subtotal then says which components it excludes.

/**
 * PROVISIONAL starter assumption shown to the buyer and editable by them.
 * Needs validating against real Greater Jakarta driving data (SPEC §15).
 */
export const DEFAULT_MONTHLY_KM = 1000;

export const costComponents = ["energy", "servicing", "tax", "insurance"] as const;
export type CostComponentKey = (typeof costComponents)[number];

/** A catalog value together with where it came from. */
export interface Sourced<T> {
  value: T;
  sourceId: string;
  verifiedOn: string;
}

export interface CostInputs {
  powertrain: Powertrain;
  monthlyKm: number;
  /** km per litre. Used for petrol, diesel, and hybrid. */
  fuelConsumptionKmPerL?: Sourced<number>;
  /** kWh per 100 km. Used for electric. */
  energyConsumptionKwhPer100Km?: Sourced<number>;
  energyType?: Sourced<EnergyType>;
  /** Price per litre or per kWh for the variant's energy type in the region. */
  energyPrice?: Sourced<number> & { energyType: EnergyType };
  serviceCostAnnual?: Sourced<number>;
  annualTax?: Sourced<number>;
  insuranceAnnual?: Sourced<number>;
}

export type CostInputName =
  | "consumption"
  | "energy_type"
  | "energy_price"
  | "service_cost_annual"
  | "annual_tax"
  | "insurance_annual";

export interface CostComponent {
  key: CostComponentKey;
  /** Whole rupiah per month, or null when it cannot be supported. */
  monthly: number | null;
  /** Inputs that were needed and absent. Empty when `monthly` is set. */
  missing: CostInputName[];
  /** True when any input used has aged past its freshness window. */
  stale: boolean;
  sourceIds: string[];
}

export interface CostEstimate {
  monthlyKm: number;
  components: CostComponent[];
  /** Sum of the available components only. */
  subtotalMonthly: number;
  /** False when the subtotal leaves out at least one component. */
  complete: boolean;
  unavailable: CostComponentKey[];
}

const unavailable = (key: CostComponentKey, missing: CostInputName[]): CostComponent => ({
  key,
  monthly: null,
  missing,
  stale: false,
  sourceIds: [],
});

function available(
  key: CostComponentKey,
  monthly: number,
  inputs: { type: "cost_input" | "energy_price" | "specification"; input: Sourced<unknown> }[],
  today: string,
): CostComponent {
  return {
    key,
    monthly: Math.round(monthly),
    missing: [],
    stale: inputs.some(({ type, input }) => isStale(type, input.verifiedOn, today)),
    sourceIds: [...new Set(inputs.map(({ input }) => input.sourceId))],
  };
}

function energyComponent(inputs: CostInputs, today: string): CostComponent {
  const consumption =
    inputs.powertrain === "electric"
      ? inputs.energyConsumptionKwhPer100Km
      : inputs.fuelConsumptionKmPerL;

  const missing: CostInputName[] = [];
  if (!consumption) missing.push("consumption");
  if (!inputs.energyType) missing.push("energy_type");
  // A price for a different fuel grade is not a usable price.
  const price =
    inputs.energyPrice && inputs.energyPrice.energyType === inputs.energyType?.value
      ? inputs.energyPrice
      : undefined;
  if (!price) missing.push("energy_price");
  if (!consumption || !inputs.energyType || !price) return unavailable("energy", missing);

  // The energy type must be priced in the unit this powertrain consumes.
  const expectsKwh = inputs.powertrain === "electric";
  if ((energyUnit(inputs.energyType.value) === "kwh") !== expectsKwh) {
    return unavailable("energy", ["energy_type"]);
  }

  const unitsPerMonth = expectsKwh
    ? (inputs.monthlyKm * consumption.value) / 100
    : inputs.monthlyKm / consumption.value;

  return available(
    "energy",
    unitsPerMonth * price.value,
    [
      { type: "specification", input: consumption },
      { type: "specification", input: inputs.energyType },
      { type: "energy_price", input: price },
    ],
    today,
  );
}

function annualComponent(
  key: CostComponentKey,
  name: CostInputName,
  input: Sourced<number> | undefined,
  today: string,
): CostComponent {
  return input
    ? available(key, input.value / 12, [{ type: "cost_input", input }], today)
    : unavailable(key, [name]);
}

export function estimateOwnershipCost(inputs: CostInputs, today: string): CostEstimate {
  if (!Number.isFinite(inputs.monthlyKm) || inputs.monthlyKm < 0) {
    throw new RangeError("monthlyKm must be a non-negative number");
  }

  const components = [
    energyComponent(inputs, today),
    annualComponent("servicing", "service_cost_annual", inputs.serviceCostAnnual, today),
    annualComponent("tax", "annual_tax", inputs.annualTax, today),
    annualComponent("insurance", "insurance_annual", inputs.insuranceAnnual, today),
  ];

  const missingKeys = components.filter((c) => c.monthly === null).map((c) => c.key);

  return {
    monthlyKm: inputs.monthlyKm,
    components,
    subtotalMonthly: components.reduce((sum, c) => sum + (c.monthly ?? 0), 0),
    complete: missingKeys.length === 0,
    unavailable: missingKeys,
  };
}
