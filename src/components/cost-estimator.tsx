"use client";

import Link from "next/link";
import { useState } from "react";

import { MAX_MONTHLY_KM, monthlyKmOf } from "@/domain/finder";
import { type CostInputs, estimateOwnershipCost } from "@/domain/ownership-cost";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, formatIdr } from "@/lib/format";
import { finderStore } from "@/lib/research-store";

import { Stamp } from "./stamp";

/**
 * The monthly ownership-cost estimate for one variant. Four separate
 * components; a missing one is shown as missing and named in the subtotal.
 */
export function CostEstimator({
  inputs,
  today,
  lang,
  dict,
  sample,
}: {
  inputs: Omit<CostInputs, "monthlyKm">;
  today: string;
  lang: Locale;
  dict: Pick<Dictionary, "cost" | "provenance">;
  sample: boolean;
}) {
  const stored = monthlyKmOf(finderStore.use());
  // The buyer's own edit on this page wins over the stored finder answer.
  const [edited, setEdited] = useState<number | null>(null);
  const monthlyKm = edited ?? stored;
  const estimate = estimateOwnershipCost({ ...inputs, monthlyKm }, today);
  const available = estimate.components.length - estimate.unavailable.length;

  return (
    <div className="border border-rule-strong bg-surface">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3 border-b border-rule-strong p-5 sm:p-6">
        <div>
          <label htmlFor="cost-km" className="type-label block text-ink-muted">
            {dict.cost.distanceLabel}
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              id="cost-km"
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_MONTHLY_KM}
              step={50}
              value={monthlyKm}
              onChange={(e) => {
                const km = e.target.valueAsNumber;
                setEdited(Number.isFinite(km) && km >= 0 ? Math.min(Math.round(km), MAX_MONTHLY_KM) : 0);
              }}
              className="type-figure min-h-12 w-36 border border-rule-strong bg-surface px-3 text-xl"
            />
            <span className="text-ink-muted">{dict.cost.distanceUnit}</span>
          </div>
        </div>
        <p className="max-w-[48ch] text-sm text-ink-muted">{dict.cost.distanceHint}</p>
      </div>

      <dl className="grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
        {estimate.components.map((component) => (
          <div
            key={component.key}
            className={`flex flex-col bg-surface p-5 sm:min-h-52 sm:p-6 ${component.monthly === null ? "cell-empty" : ""}`}
          >
            <dt className="type-label text-ink-muted">{dict.cost.components[component.key]}</dt>
            <dd className="mt-3 flex flex-1 flex-col">
              {component.monthly === null ? (
                <>
                  <span className="type-figure text-[1.375rem] text-ink-muted">{dict.cost.unavailable}</span>
                  <span className="mt-auto block pt-4 text-sm text-ink-muted">
                    {fill(dict.cost.missing, {
                      inputs: component.missing.map((m) => dict.cost.inputs[m]).join(", "),
                    })}
                  </span>
                </>
              ) : (
                <>
                  <span className="type-figure text-[1.375rem]">
                    {formatIdr(component.monthly, lang)}
                    <span className="text-base font-normal text-ink-muted"> {dict.cost.perMonth}</span>
                  </span>
                  <span className="mt-4 block">
                    {component.stale ? (
                      <Stamp kind="stale">{dict.provenance.stale}</Stamp>
                    ) : (
                      <Stamp kind="estimate">{sample ? dict.provenance.sample : dict.provenance.estimate}</Stamp>
                    )}
                  </span>
                  <span className="mt-auto block pt-4 text-sm text-ink-muted">
                    {dict.cost.basis[component.key]}
                  </span>
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className="border-t border-rule-strong p-5 sm:p-6">
        <p className="type-figure text-xl" role="status">
          {fill(estimate.complete ? dict.cost.total : dict.cost.subtotal, {
            amount: formatIdr(estimate.subtotalMonthly, lang),
            count: available,
          })}
        </p>
        {estimate.complete ? null : (
          <p className="mt-1 text-ink">
            {fill(dict.cost.excludes, {
              components: estimate.unavailable.map((key) => dict.cost.components[key]).join(", "),
            })}
          </p>
        )}
        <p className="mt-3 max-w-[70ch] text-sm text-ink-muted">
          {dict.cost.disclaimer}{" "}
          <Link href={`/${lang}/how-we-compare#cost`} className="underline">
            {dict.cost.methodLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
