// Vocabulary shared by the database schema, CSV validation, and domain rules.
// Adding a value here is what makes it acceptable in an import.

export const regions = ["jabodetabek"] as const;
export type Region = (typeof regions)[number];

export const powertrains = ["petrol", "diesel", "hybrid", "electric"] as const;
export type Powertrain = (typeof powertrains)[number];

export const bodyStyles = [
  "hatchback",
  "sedan",
  "suv",
  "mpv",
  "pickup",
  "van",
  "coupe",
] as const;
export type BodyStyle = (typeof bodyStyles)[number];

export const transmissions = ["manual", "automatic", "cvt", "dct", "single_speed"] as const;
export type Transmission = (typeof transmissions)[number];

export const publicationStatuses = ["draft", "published", "withdrawn"] as const;
export type PublicationStatus = (typeof publicationStatuses)[number];

/**
 * How a source may be relied on (SPEC §8). `sample` marks development seed
 * data, which must never be presented as a verified launch-market fact.
 */
export const sourceKinds = ["official", "authoritative", "computed", "sample"] as const;
export type SourceKind = (typeof sourceKinds)[number];

export const energyTypes = [
  "petrol_ron90",
  "petrol_ron92",
  "petrol_ron95",
  "petrol_ron98",
  "diesel_cn48",
  "diesel_cn51",
  "diesel_cn53",
  "electricity_home",
] as const;
export type EnergyType = (typeof energyTypes)[number];

/** Unit each energy type is priced in. */
export const energyUnit = (type: EnergyType): "l" | "kwh" =>
  type === "electricity_home" ? "kwh" : "l";

/**
 * Specification facts. Each is stored with its own source and verification
 * date. `unit` is the only unit an import may state for that key.
 */
export const factDefinitions = {
  seats: { type: "number", unit: "count", integer: true },
  length_mm: { type: "number", unit: "mm", integer: true },
  width_mm: { type: "number", unit: "mm", integer: true },
  height_mm: { type: "number", unit: "mm", integer: true },
  wheelbase_mm: { type: "number", unit: "mm", integer: true },
  ground_clearance_mm: { type: "number", unit: "mm", integer: true },
  cargo_volume_l: { type: "number", unit: "l", integer: false },
  engine_displacement_cc: { type: "number", unit: "cc", integer: true },
  power_kw: { type: "number", unit: "kw", integer: false },
  torque_nm: { type: "number", unit: "nm", integer: false },
  battery_capacity_kwh: { type: "number", unit: "kwh", integer: false },
  range_km: { type: "number", unit: "km", integer: false },
  fuel_consumption_km_per_l: { type: "number", unit: "km/l", integer: false },
  energy_consumption_kwh_per_100km: { type: "number", unit: "kwh/100km", integer: false },
  energy_type: { type: "enum", unit: "", values: energyTypes },
  // Inputs to the ownership-cost estimate.
  service_cost_annual_idr: { type: "number", unit: "idr/year", integer: true },
  annual_tax_idr: { type: "number", unit: "idr/year", integer: true },
  insurance_annual_idr: { type: "number", unit: "idr/year", integer: true },
} as const satisfies Record<
  string,
  | { type: "number"; unit: string; integer: boolean }
  | { type: "enum"; unit: ""; values: readonly string[] }
>;

export type FactKey = keyof typeof factDefinitions;
export const factKeys = Object.keys(factDefinitions) as FactKey[];
export const isFactKey = (value: string): value is FactKey => value in factDefinitions;

export const featureCategories = ["safety", "comfort", "infotainment", "practicality"] as const;
export type FeatureCategory = (typeof featureCategories)[number];

/** Equipment the value-for-money breakdown can compare, grouped by category. */
export const featureDefinitions = {
  abs: "safety",
  stability_control: "safety",
  airbags_front: "safety",
  airbags_side_curtain: "safety",
  isofix: "safety",
  rear_camera: "safety",
  autonomous_emergency_braking: "safety",
  lane_keep_assist: "safety",
  blind_spot_monitor: "safety",
  auto_climate: "comfort",
  keyless_entry: "comfort",
  cruise_control: "comfort",
  adaptive_cruise_control: "comfort",
  power_driver_seat: "comfort",
  sunroof: "comfort",
  touchscreen: "infotainment",
  smartphone_mirroring: "infotainment",
  third_row_seats: "practicality",
  power_tailgate: "practicality",
  roof_rails: "practicality",
} as const satisfies Record<string, FeatureCategory>;

export type FeatureKey = keyof typeof featureDefinitions;
export const featureKeys = Object.keys(featureDefinitions) as FeatureKey[];
export const isFeatureKey = (value: string): value is FeatureKey => value in featureDefinitions;

/**
 * SPEC §7: an unverified feature is never treated as included. A feature
 * with no row at all is "unknown", which is different from `unavailable`.
 */
export const featureAvailabilities = [
  "standard",
  "optional",
  "unavailable",
  "not_applicable",
] as const;
export type FeatureAvailability = (typeof featureAvailabilities)[number];

export const warrantyCoverages = ["vehicle", "powertrain", "battery", "corrosion"] as const;
export type WarrantyCoverage = (typeof warrantyCoverages)[number];

/** True when `value` is one of the members of a const list. */
export const isOneOf = <T extends string>(list: readonly T[], value: string): value is T =>
  (list as readonly string[]).includes(value);
