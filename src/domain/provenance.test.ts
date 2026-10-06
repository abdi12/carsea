import { describe, expect, it } from "vitest";

import { daysBetween, isStale, parseIsoDate, priceStatus } from "./provenance";

describe("parseIsoDate", () => {
  it("accepts real calendar dates only", () => {
    expect(parseIsoDate("2026-02-28")).not.toBeNull();
    expect(parseIsoDate("2026-02-30")).toBeNull();
    expect(parseIsoDate("2026-13-01")).toBeNull();
    expect(parseIsoDate("28/02/2026")).toBeNull();
    expect(parseIsoDate("2026-2-8")).toBeNull();
  });
});

describe("daysBetween", () => {
  it("counts whole days and is signed", () => {
    expect(daysBetween("2026-01-01", "2026-01-31")).toBe(30);
    expect(daysBetween("2026-01-31", "2026-01-01")).toBe(-30);
  });
});

describe("isStale", () => {
  it("turns stale the day after the window ends", () => {
    expect(isStale("price", "2026-01-01", "2026-04-01")).toBe(false); // day 90
    expect(isStale("price", "2026-01-01", "2026-04-02")).toBe(true); // day 91
  });

  it("uses a different window per data type", () => {
    expect(isStale("specification", "2026-01-01", "2026-04-02")).toBe(false);
  });
});

describe("priceStatus", () => {
  const price = { validFrom: "2026-06-01", validUntil: "2026-06-30", verifiedOn: "2026-06-01" };

  it("is current inside its validity window", () => {
    expect(priceStatus(price, "2026-06-15")).toBe("current");
    expect(priceStatus(price, "2026-06-30")).toBe("current");
  });

  it("reports why a price is not usable", () => {
    expect(priceStatus(price, "2026-05-31")).toBe("not_yet_valid");
    expect(priceStatus(price, "2026-07-01")).toBe("expired");
    expect(priceStatus({ ...price, validUntil: null }, "2026-12-01")).toBe("stale");
  });
});
