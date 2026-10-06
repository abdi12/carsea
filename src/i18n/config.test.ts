import { describe, expect, it } from "vitest";

import { isLocale, localeFromPathname, localizePathname } from "./config";

describe("isLocale", () => {
  it("accepts supported locales only", () => {
    expect(isLocale("id")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe("localeFromPathname", () => {
  it("reads a supported locale prefix", () => {
    expect(localeFromPathname("/en/cars")).toBe("en");
    expect(localeFromPathname("/id")).toBe("id");
  });

  it("ignores unprefixed and look-alike paths", () => {
    expect(localeFromPathname("/")).toBeUndefined();
    expect(localeFromPathname("/cars")).toBeUndefined();
    expect(localeFromPathname("/english")).toBeUndefined();
  });
});

describe("localizePathname", () => {
  it("swaps an existing locale prefix", () => {
    expect(localizePathname("/id/cars/x", "en")).toBe("/en/cars/x");
    expect(localizePathname("/en", "id")).toBe("/id");
  });

  it("adds a prefix to an unprefixed path", () => {
    expect(localizePathname("/", "id")).toBe("/id");
    expect(localizePathname("/cars", "en")).toBe("/en/cars");
  });
});
