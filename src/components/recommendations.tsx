"use client";

import Link from "next/link";
import { useMemo } from "react";

import { type VariantSummary, toMatchCandidate, variantName } from "@/domain/catalog-view";
import { hasAnyAnswer, monthlyKmOf, toBuyerAnswers } from "@/domain/finder";
import { type ExclusionReason, type Reason, matchCars } from "@/domain/matching";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, formatIdr, formatNumber } from "@/lib/format";
import { finderStore, useHydrated } from "@/lib/research-store";

import { ButtonLink } from "./button";
import { CarActions } from "./car-actions";
import { ArrowRightIcon } from "./icons";
import { EmptySheet, Notice, SkeletonSheet } from "./page-parts";
import { PriceLine } from "./price-line";

type Dict = Pick<Dictionary, "recs" | "price" | "actions" | "states" | "labels">;

const outcomes = ["met", "unmet", "unknown"] as const;

export function Recommendations({
  cars,
  lang,
  dict,
}: {
  cars: VariantSummary[];
  lang: Locale;
  dict: Dict;
}) {
  const hydrated = useHydrated();
  const answers = finderStore.use();
  const monthlyKm = monthlyKmOf(answers);

  // Matching runs here, in the browser: the answers never leave it.
  const result = useMemo(
    () =>
      matchCars(
        cars.map((car) => toMatchCandidate(car, monthlyKm)),
        toBuyerAnswers(answers),
      ),
    [cars, answers, monthlyKm],
  );

  if (!hydrated) return <SkeletonSheet rows={3} label={dict.states.loading} />;

  if (!hasAnyAnswer(answers)) {
    return (
      <EmptySheet title={dict.recs.noAnswers.title} body={dict.recs.noAnswers.body}>
        <ButtonLink href={`/${lang}/find`}>
          {dict.recs.noAnswers.action}
          <ArrowRightIcon />
        </ButtonLink>
        <ButtonLink href={`/${lang}/cars`} variant="outline">
          {dict.recs.browse}
        </ButtonLink>
      </EmptySheet>
    );
  }

  const byId = new Map(cars.map((car) => [car.id, car]));
  const excludedCounts = result.excluded.reduce<Partial<Record<ExclusionReason, number>>>(
    (counts, e) => ({ ...counts, [e.reason]: (counts[e.reason] ?? 0) + 1 }),
    {},
  );
  const reasonText = (reason: Reason) =>
    (dict.recs.reasons as Record<string, Partial<Record<Reason["outcome"], string>>>)[reason.code]?.[
      reason.outcome
    ] ?? reason.code;

  const excludedList = (
    <ul className="mt-2 list-disc pl-5 text-ink-muted">
      {(Object.entries(excludedCounts) as [ExclusionReason, number][]).map(([reason, count]) => (
        <li key={reason}>{fill(dict.recs.excluded[reason], { count })}</li>
      ))}
    </ul>
  );

  if (result.matches.length === 0) {
    return (
      <EmptySheet title={dict.recs.none.title} body={dict.recs.none.body}>
        <ButtonLink href={`/${lang}/find`}>{dict.recs.revise}</ButtonLink>
        <ButtonLink href={`/${lang}/cars`} variant="outline">
          {dict.recs.browse}
        </ButtonLink>
        {result.excluded.length ? <div className="basis-full">{excludedList}</div> : null}
      </EmptySheet>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p role="status" className="type-title text-xl">
          {fill(dict.recs.count, { count: result.matches.length })}
        </p>
        <ButtonLink href={`/${lang}/find`} variant="outline">
          {dict.recs.revise}
        </ButtonLink>
      </div>

      {result.limited ? <Notice className="mt-4">{dict.recs.limited}</Notice> : null}
      {result.evidenceMissing ? <Notice className="mt-4">{dict.recs.evidenceMissing}</Notice> : null}

      <ol className="mt-6 border border-rule-strong bg-surface">
        {result.matches.map((match) => {
          const car = byId.get(match.variantId)!;
          const energy = car.energyCostPerKm === null ? null : Math.round(car.energyCostPerKm * monthlyKm);
          return (
            <li key={car.id} className="border-b border-rule-strong p-5 last:border-b-0 sm:p-7">
              <div className="grid gap-x-8 gap-y-3 md:grid-cols-[1fr_auto]">
                <div>
                  <h2 className="type-title text-2xl">
                    <Link href={`/${lang}/cars/${car.id}`} className="hover:underline">
                      {variantName(car)}
                    </Link>
                  </h2>
                  <p className="mt-1 text-ink-muted">
                    {[car.modelYear, dict.labels.bodyStyles[car.bodyStyle], dict.labels.powertrains[car.powertrain]].join(" · ")}
                  </p>
                </div>
                <div className="md:text-right">
                  <PriceLine price={car.price} lang={lang} dict={dict.price} />
                </div>
              </div>

              <div className="mt-5 grid gap-px border border-rule bg-rule md:grid-cols-3">
                {outcomes.map((outcome) => {
                  const reasons = match.reasons.filter((r) => r.outcome === outcome);
                  return (
                    <div key={outcome} className={`bg-surface p-4 ${reasons.length ? "" : "cell-empty"}`}>
                      <h3 className="type-label text-ink-muted">{dict.recs.groups[outcome]}</h3>
                      {reasons.length ? (
                        <ul className="mt-2 space-y-1.5">
                          {reasons.map((reason) => (
                            <li key={reason.code}>{reasonText(reason)}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-ink-muted">{dict.recs.groupEmpty[outcome]}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 text-sm text-ink-muted">
                {energy === null
                  ? dict.recs.energyUnknown
                  : fill(dict.recs.energy, {
                      amount: formatIdr(energy, lang),
                      km: formatNumber(monthlyKm, lang, 0),
                    })}
              </p>

              <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                <CarActions id={car.id} name={variantName(car)} lang={lang} dict={dict.actions} />
                <ButtonLink href={`/${lang}/cars/${car.id}`}>
                  {dict.recs.view}
                  <ArrowRightIcon />
                </ButtonLink>
              </div>
            </li>
          );
        })}
      </ol>

      {result.excluded.length ? (
        <div className="mt-8">
          <h2 className="type-title text-lg">{dict.recs.excludedTitle}</h2>
          {excludedList}
        </div>
      ) : null}

      <p className="mt-8 max-w-[65ch] text-sm text-ink-muted">
        {dict.recs.method}{" "}
        <Link href={`/${lang}/how-we-compare`} className="underline">
          {dict.recs.methodLink}
        </Link>
      </p>
    </div>
  );
}
