import { describe, expect, it } from "vitest";

import en from "./dictionaries/en.json";
import id from "./dictionaries/id.json";

// Every key path, with array items counted by index, so a list that is
// shorter in one locale fails too.
function keyPaths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object") return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("dictionaries", () => {
  it("have identical key sets in both locales", () => {
    expect(keyPaths(en).sort()).toEqual(keyPaths(id).sort());
  });

  it("leave no string empty", () => {
    for (const dict of [id, en]) {
      const empty = keyPaths(dict).filter((path) => {
        const leaf = path
          .split(".")
          .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], dict);
        return typeof leaf !== "string" || leaf.trim() === "";
      });
      expect(empty).toEqual([]);
    }
  });
});
