"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { powertrains } from "@/domain/catalog";
import {
  type FinderAnswers,
  type FinderStep,
  MAX_MONTHLY_KM,
  budgetOptions,
  finderSteps,
  hasAnyAnswer,
  monthlyKmOf,
  seatOptions,
} from "@/domain/finder";
import { MAX_PRIORITIES, priorities, uses } from "@/domain/matching";
import { DEFAULT_MONTHLY_KM } from "@/domain/ownership-cost";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, formatNumber } from "@/lib/format";
import { finderStore, useHydrated, useStorageAvailable } from "@/lib/research-store";

import { Button } from "./button";
import { ChoiceCells } from "./choice-cells";
import { ArrowRightIcon } from "./icons";
import { Notice, SkeletonSheet } from "./page-parts";

type Dict = Pick<Dictionary, "find" | "budget" | "labels" | "states">;

const answered = (answers: FinderAnswers, step: FinderStep): boolean => {
  switch (step) {
    case "budget":
      return answers.budget !== undefined;
    case "seats":
      return answers.seats !== undefined;
    case "distance":
      return answers.monthlyKm !== undefined;
    default:
      return (answers[step]?.length ?? 0) > 0;
  }
};

export function Finder({ lang, dict }: { lang: Locale; dict: Dict }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const storageAvailable = useStorageAvailable();
  const answers = finderStore.use();
  // null = decide from the stored answers on first render.
  const [position, setPosition] = useState<number | "review" | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  const firstOpen = finderSteps.findIndex((step) => !answered(answers, step));
  const current: number | "review" =
    position ?? (hasAnyAnswer(answers) && firstOpen === -1 ? "review" : Math.max(firstOpen, 0));

  // Move focus to the new question, but not on first load.
  useEffect(() => {
    if (moved.current) heading.current?.focus();
  }, [current]);
  const go = (next: number | "review") => {
    moved.current = true;
    setPosition(next);
  };

  if (!hydrated) return <SkeletonSheet rows={3} label={dict.states.loading} />;

  const update = (patch: Partial<FinderAnswers>) => {
    // Answering must not move the buyer on; only the buttons do that.
    if (position === null) setPosition(current);
    const next = { ...answers, ...patch };
    for (const key of Object.keys(next) as (keyof FinderAnswers)[]) {
      const value = next[key];
      if (value === undefined || (Array.isArray(value) && value.length === 0)) delete next[key];
    }
    finderStore.set(next);
  };
  const toggleIn = <T extends string>(list: T[] | undefined, value: T, max = Infinity) => {
    const now = list ?? [];
    if (now.includes(value)) return now.filter((v) => v !== value);
    return now.length >= max ? now : [...now, value];
  };

  const describe = (step: FinderStep): string => {
    if (!answered(answers, step)) return dict.find.skipped;
    switch (step) {
      case "budget":
        return dict.budget.options[answers.budget!];
      case "seats":
        return dict.find.seats.options[answers.seats!];
      case "uses":
        return answers.uses!.map((u) => dict.find.uses.options[u].label).join(", ");
      case "powertrains":
        return answers.powertrains!.map((p) => dict.labels.powertrains[p]).join(", ");
      case "priorities":
        return answers.priorities!.map((p) => dict.find.priorities.options[p].label).join(", ");
      case "distance":
        return fill(dict.find.distance.value, { km: formatNumber(answers.monthlyKm!, lang, 0) });
    }
  };

  const storageNotice = storageAvailable ? null : (
    <Notice className="mb-6">{dict.states.storageUnavailable}</Notice>
  );

  if (current === "review") {
    return (
      <div>
        {storageNotice}
        <div className="border border-rule-strong bg-surface">
          <h2 ref={heading} tabIndex={-1} className="type-title px-5 pt-6 text-2xl outline-none sm:px-7">
            {dict.find.review.title}
          </h2>
          <p className="max-w-[65ch] px-5 pt-2 pb-5 text-ink-muted sm:px-7">{dict.find.review.body}</p>
          <dl className="border-y border-rule">
            {finderSteps.map((step, index) => (
              <div
                key={step}
                className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 border-b border-rule px-5 py-4 last:border-b-0 sm:grid-cols-[14rem_1fr_auto] sm:px-7"
              >
                <dt className="type-label text-ink-muted">{dict.find.stepNames[step]}</dt>
                <dd className={`col-start-1 sm:col-start-2 ${answered(answers, step) ? "" : "text-ink-muted"}`}>
                  {step === "distance" && !answered(answers, step)
                    ? fill(dict.find.distance.assumed, { km: formatNumber(DEFAULT_MONTHLY_KM, lang, 0) })
                    : describe(step)}
                </dd>
                <button
                  type="button"
                  onClick={() => go(index)}
                  aria-label={`${dict.find.review.edit}: ${dict.find.stepNames[step]}`}
                  className="type-label col-start-2 row-span-2 row-start-1 min-h-11 px-2 underline sm:col-start-3 sm:row-span-1"
                >
                  {dict.find.review.edit}
                </button>
              </div>
            ))}
          </dl>
          <p className="px-5 pt-4 text-sm text-ink-muted sm:px-7">{dict.find.review.region}</p>
          <div className="flex flex-col-reverse gap-3 p-4 sm:flex-row sm:justify-between sm:px-7 sm:py-5">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                finderStore.clear();
                go(0);
              }}
            >
              {dict.find.review.clear}
            </Button>
            <Button type="button" onClick={() => router.push(`/${lang}/recommendations`)}>
              {dict.find.review.submit}
              <ArrowRightIcon />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const step = finderSteps[current];
  const isLast = current === finderSteps.length - 1;
  const text = dict.find[step === "budget" ? "budgetStep" : step];

  return (
    <div>
      {storageNotice}
      <form
        className="border border-rule-strong bg-surface"
        onSubmit={(e) => {
          e.preventDefault();
          go(isLast ? "review" : current + 1);
        }}
      >
        <fieldset>
          <legend className="w-full px-5 pt-6 sm:px-7">
            {/* The count is real sequence information: where you are in six. */}
            <span className="type-label block text-ink-muted" role="status">
              {fill(dict.find.progress, { current: current + 1, total: finderSteps.length })}
            </span>
            <span ref={heading} tabIndex={-1} className="type-title mt-2 block text-2xl outline-none sm:text-[1.75rem]">
              {text.title}
            </span>
          </legend>
          <p className="max-w-[65ch] px-5 pt-2 pb-5 text-ink-muted sm:px-7">{text.hint}</p>

          {step === "budget" ? (
            <ChoiceCells
              name="budget"
              selectedLabel={dict.budget.selected}
              selected={answers.budget ? [answers.budget] : []}
              onToggle={(v) => update({ budget: answers.budget === v ? undefined : v })}
              choices={budgetOptions.map((value) => ({ value, label: dict.budget.options[value] }))}
            />
          ) : step === "seats" ? (
            <ChoiceCells
              name="seats"
              columns="grid-cols-2"
              selectedLabel={dict.budget.selected}
              selected={answers.seats ? [answers.seats] : []}
              onToggle={(v) => update({ seats: answers.seats === v ? undefined : v })}
              choices={seatOptions.map((value) => ({ value, label: dict.find.seats.options[value] }))}
            />
          ) : step === "uses" ? (
            <ChoiceCells
              name="uses"
              multiple
              columns="grid-cols-1 sm:grid-cols-3"
              selectedLabel={dict.budget.selected}
              selected={answers.uses ?? []}
              onToggle={(v) => update({ uses: toggleIn(answers.uses, v) })}
              choices={uses.map((value) => ({ value, ...dict.find.uses.options[value] }))}
            />
          ) : step === "powertrains" ? (
            <ChoiceCells
              name="powertrains"
              multiple
              selectedLabel={dict.budget.selected}
              selected={answers.powertrains ?? []}
              onToggle={(v) => update({ powertrains: toggleIn(answers.powertrains, v) })}
              choices={powertrains.map((value) => ({
                value,
                label: dict.labels.powertrains[value],
                hint: dict.find.powertrains.hints[value],
              }))}
            />
          ) : step === "priorities" ? (
            <>
              <ChoiceCells
                name="priorities"
                multiple
                columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
                selectedLabel={dict.budget.selected}
                selected={answers.priorities ?? []}
                onToggle={(v) => update({ priorities: toggleIn(answers.priorities, v, MAX_PRIORITIES) })}
                choices={priorities.map((value) => ({ value, ...dict.find.priorities.options[value] }))}
              />
              <p role="status" className="px-5 pt-3 text-sm text-ink-muted sm:px-7">
                {fill(dict.find.priorities.count, {
                  count: answers.priorities?.length ?? 0,
                  max: MAX_PRIORITIES,
                })}
              </p>
            </>
          ) : (
            <div className="border-y border-rule px-5 py-6 sm:px-7">
              <label htmlFor="monthly-km" className="type-label block text-ink-muted">
                {dict.find.distance.label}
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id="monthly-km"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={MAX_MONTHLY_KM}
                  step={50}
                  value={answers.monthlyKm ?? ""}
                  placeholder={String(DEFAULT_MONTHLY_KM)}
                  onChange={(e) => {
                    const km = e.target.valueAsNumber;
                    update({
                      monthlyKm:
                        Number.isFinite(km) && km >= 0 ? Math.min(Math.round(km), MAX_MONTHLY_KM) : undefined,
                    });
                  }}
                  className="type-figure min-h-12 w-40 border border-rule-strong bg-surface px-3 text-xl"
                />
                <span className="text-ink-muted">{dict.find.distance.unit}</span>
              </div>
              <p className="mt-3 max-w-[60ch] text-sm text-ink-muted">
                {fill(dict.find.distance.assumed, { km: formatNumber(monthlyKmOf({}), lang, 0) })}
              </p>
            </div>
          )}
        </fieldset>

        <div className="flex flex-col-reverse gap-3 p-4 sm:flex-row sm:justify-between sm:px-7 sm:py-5">
          <div className="flex gap-3">
            {current > 0 ? (
              <Button variant="outline" type="button" onClick={() => go(current - 1)} className="flex-1 sm:flex-none">
                {dict.find.back}
              </Button>
            ) : null}
            {hasAnyAnswer(answers) ? (
              <button type="button" onClick={() => go("review")} className="type-label min-h-12 px-3 underline">
                {dict.find.toReview}
              </button>
            ) : null}
          </div>
          <Button type="submit">
            {answered(answers, step) ? (isLast ? dict.find.finish : dict.find.next) : dict.find.skip}
            <ArrowRightIcon />
          </Button>
        </div>
      </form>
    </div>
  );
}
