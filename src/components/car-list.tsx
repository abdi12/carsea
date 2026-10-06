"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { type BodyStyle, type Powertrain, bodyStyles, powertrains } from "@/domain/catalog";
import { type VariantSummary, currentPrice, variantName } from "@/domain/catalog-view";
import { type BudgetOption, budgetMax, budgetOptions } from "@/domain/finder";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/lib/format";

import { CarActions } from "./car-actions";
import { EmptySheet } from "./page-parts";
import { PriceLine } from "./price-line";
import { Stamp } from "./stamp";

interface Filters {
  query: string;
  budget: BudgetOption | "";
  seats: "" | "5" | "6";
  bodyStyles: BodyStyle[];
  powertrains: Powertrain[];
}

const noFilters: Filters = { query: "", budget: "", seats: "", bodyStyles: [], powertrains: [] };

const field =
  "min-h-11 w-full border border-rule-strong bg-surface px-3 text-ink placeholder:text-ink-muted";

export function CarList({
  cars,
  lang,
  dict,
}: {
  cars: VariantSummary[];
  lang: Locale;
  dict: Pick<Dictionary, "cars" | "labels" | "price" | "actions" | "budget" | "provenance">;
}) {
  const [filters, setFilters] = useState(noFilters);
  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));
  const toggleIn = <T,>(list: T[], value: T) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  // Offer only the values the catalog actually has.
  const presentBodies = bodyStyles.filter((b) => cars.some((c) => c.bodyStyle === b));
  const presentPowertrains = powertrains.filter((p) => cars.some((c) => c.powertrain === p));

  const shown = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    const max = filters.budget ? budgetMax[filters.budget] : undefined;
    return cars.filter((car) => {
      if (query && !variantName(car).toLowerCase().includes(query)) return false;
      if (filters.bodyStyles.length && !filters.bodyStyles.includes(car.bodyStyle)) return false;
      if (filters.powertrains.length && !filters.powertrains.includes(car.powertrain)) return false;
      // A price or seat filter needs a known, current value to pass.
      if (max !== undefined && !((currentPrice(car) ?? Infinity) <= max)) return false;
      if (filters.seats && !((car.seats ?? 0) >= Number(filters.seats))) return false;
      return true;
    });
  }, [cars, filters]);

  const active = filters !== noFilters && JSON.stringify(filters) !== JSON.stringify(noFilters);

  return (
    <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
      <form
        aria-label={dict.cars.filters.title}
        onSubmit={(e) => e.preventDefault()}
        className="h-fit border border-rule-strong bg-surface"
      >
        <div className="border-b border-rule p-4">
          <label htmlFor="car-search" className="type-label block text-ink-muted">
            {dict.cars.filters.search}
          </label>
          <input
            id="car-search"
            type="search"
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
            placeholder={dict.cars.filters.searchPlaceholder}
            className={`${field} mt-2`}
          />
        </div>
        <div className="grid grid-cols-2 gap-px border-b border-rule bg-rule lg:grid-cols-1">
          <div className="bg-surface p-4">
            <label htmlFor="car-budget" className="type-label block text-ink-muted">
              {dict.cars.filters.price}
            </label>
            <select
              id="car-budget"
              value={filters.budget}
              onChange={(e) => set({ budget: e.target.value as Filters["budget"] })}
              className={`${field} mt-2`}
            >
              <option value="">{dict.cars.filters.any}</option>
              {budgetOptions
                .filter((o) => budgetMax[o] !== undefined)
                .map((o) => (
                  <option key={o} value={o}>
                    {dict.cars.filters.upTo[o as "under200" | "200to350" | "350to500"]}
                  </option>
                ))}
            </select>
          </div>
          <div className="bg-surface p-4">
            <label htmlFor="car-seats" className="type-label block text-ink-muted">
              {dict.cars.filters.seats}
            </label>
            <select
              id="car-seats"
              value={filters.seats}
              onChange={(e) => set({ seats: e.target.value as Filters["seats"] })}
              className={`${field} mt-2`}
            >
              <option value="">{dict.cars.filters.any}</option>
              <option value="5">{dict.cars.filters.seats5}</option>
              <option value="6">{dict.cars.filters.seats6}</option>
            </select>
          </div>
        </div>
        {(
          [
            ["bodyStyles", presentBodies, dict.labels.bodyStyles, dict.cars.filters.bodyStyle],
            ["powertrains", presentPowertrains, dict.labels.powertrains, dict.cars.filters.powertrain],
          ] as const
        ).map(([key, values, labels, legend]) =>
          values.length > 1 ? (
            <fieldset key={key} className="border-b border-rule p-4">
              <legend className="type-label text-ink-muted">{legend}</legend>
              <div className="mt-1 grid grid-cols-2 lg:grid-cols-1">
                {values.map((value) => (
                  <label key={value} className="flex min-h-11 cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={(filters[key] as string[]).includes(value)}
                      onChange={() =>
                        set({ [key]: toggleIn(filters[key] as string[], value) } as Partial<Filters>)
                      }
                      className="size-5 accent-[var(--stamp)]"
                    />
                    {(labels as Record<string, string>)[value]}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null,
        )}
        <div className="p-4">
          <button
            type="button"
            disabled={!active}
            onClick={() => setFilters(noFilters)}
            className="type-label min-h-11 w-full border-2 border-rule-strong px-4 text-ink hover:bg-ink hover:text-page disabled:border-rule disabled:text-ink-muted disabled:hover:bg-transparent"
          >
            {dict.cars.filters.clear}
          </button>
        </div>
      </form>

      <div>
        <p role="status" className="type-label text-ink-muted">
          {fill(active ? dict.cars.countFiltered : dict.cars.count, {
            shown: shown.length,
            total: cars.length,
          })}
        </p>

        {shown.length === 0 ? (
          <div className="mt-4">
            <EmptySheet title={dict.cars.noMatch.title} body={dict.cars.noMatch.body}>
              <button
                type="button"
                onClick={() => setFilters(noFilters)}
                className="type-label min-h-12 bg-cover px-5 text-on-cover hover:bg-cover-deep"
              >
                {dict.cars.filters.clear}
              </button>
            </EmptySheet>
          </div>
        ) : (
          <ul className="mt-4 border border-rule-strong bg-surface">
            {shown.map((car) => (
              <li
                key={car.id}
                className="grid gap-x-8 gap-y-4 border-b border-rule p-5 last:border-b-0 sm:p-6 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <h2 className="type-title text-xl">
                    <Link href={`/${lang}/cars/${car.id}`} className="hover:underline">
                      {variantName(car)}
                    </Link>
                  </h2>
                  <p className="mt-1 text-ink-muted">
                    {[
                      car.modelYear,
                      dict.labels.bodyStyles[car.bodyStyle],
                      dict.labels.powertrains[car.powertrain],
                      dict.labels.transmissions[car.transmission],
                      car.seats === null ? null : fill(dict.cars.seatCount, { count: car.seats }),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {car.sample ? (
                    <p className="mt-3">
                      <Stamp kind="estimate">{dict.provenance.sample}</Stamp>
                    </p>
                  ) : null}
                </div>
                <div className="md:text-right">
                  <PriceLine price={car.price} lang={lang} dict={dict.price} />
                </div>
                <div className="md:col-span-2">
                  <CarActions id={car.id} name={variantName(car)} lang={lang} dict={dict.actions} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
