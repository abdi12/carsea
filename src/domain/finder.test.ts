import { describe, expect, it } from "vitest";

import { monthlyKmOf, parseFinderAnswers, parseIdList, toBuyerAnswers } from "./finder";

describe("toBuyerAnswers", () => {
  it("adds no rule for a skipped question", () => {
    expect(toBuyerAnswers({})).toEqual({
      budgetMax: undefined,
      minSeats: undefined,
      uses: undefined,
      powertrains: undefined,
      priorities: undefined,
    });
  });

  it("maps brackets to their upper bound and leaves the top one open", () => {
    expect(toBuyerAnswers({ budget: "200to350" }).budgetMax).toBe(350_000_000);
    expect(toBuyerAnswers({ budget: "over500" }).budgetMax).toBeUndefined();
    expect(toBuyerAnswers({ seats: "six_plus" }).minSeats).toBe(6);
  });
});

describe("monthlyKmOf", () => {
  it("falls back to the disclosed starter assumption", () => {
    expect(monthlyKmOf({})).toBe(1000);
    expect(monthlyKmOf({ monthlyKm: 0 })).toBe(0);
  });
});

describe("parseFinderAnswers", () => {
  it("keeps valid answers", () => {
    const answers = { budget: "under200", seats: "five", uses: ["city"], powertrains: ["hybrid"], priorities: ["safety"], monthlyKm: 1500 };
    expect(parseFinderAnswers(answers)).toEqual(answers);
  });

  it("drops anything it does not recognise", () => {
    expect(
      parseFinderAnswers({ budget: "free", seats: 5, uses: ["city", "moon", "city"], powertrains: "hybrid", priorities: [], monthlyKm: -3, extra: 1 }),
    ).toEqual({ uses: ["city"] });
    expect(parseFinderAnswers(null)).toEqual({});
    expect(parseFinderAnswers("budget")).toEqual({});
  });

  it("caps priorities at three and distance at the maximum", () => {
    expect(parseFinderAnswers({ priorities: ["safety", "comfort", "space", "warranty"] }).priorities).toHaveLength(3);
    expect(parseFinderAnswers({ monthlyKm: 999_999 })).toEqual({});
  });
});

describe("parseIdList", () => {
  it("keeps well-formed unique ids up to the limit", () => {
    expect(parseIdList(["a-1", "a-1", "B", 3, "c", "d", "e"], 3)).toEqual(["a-1", "c", "d"]);
    expect(parseIdList("a", 3)).toEqual([]);
  });
});
