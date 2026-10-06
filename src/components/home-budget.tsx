"use client";

import { useRouter } from "next/navigation";

import { budgetOptions } from "@/domain/finder";
import type { Dictionary } from "@/i18n/dictionaries";
import { finderStore } from "@/lib/research-store";

import { Button } from "./button";
import { ChoiceCells } from "./choice-cells";
import { ArrowRightIcon } from "./icons";

/**
 * The finder's first question, placed on the home page. The answer is kept
 * in this browser and the finder carries on from the second question.
 */
export function HomeBudget({ action, dict }: { action: string; dict: Dictionary["budget"] }) {
  const router = useRouter();
  const budget = finderStore.use().budget;

  return (
    <form
      action={action}
      onSubmit={(event) => {
        event.preventDefault();
        router.push(action);
      }}
    >
      <fieldset>
        <legend className="type-title px-5 pt-6 text-2xl sm:px-7 sm:text-[1.75rem]">{dict.legend}</legend>
        <p className="max-w-[65ch] px-5 pt-2 pb-5 text-ink-muted sm:px-7">{dict.hint}</p>
        <ChoiceCells
          name="budget"
          selectedLabel={dict.selected}
          selected={budget ? [budget] : []}
          onToggle={(value) => {
            const next = { ...finderStore.get() };
            if (budget === value) delete next.budget;
            else next.budget = value;
            finderStore.set(next);
          }}
          choices={budgetOptions.map((value) => ({ value, label: dict.options[value] }))}
        />
      </fieldset>
      <div className="flex justify-end p-4 sm:px-7 sm:py-5">
        <Button type="submit" className="w-full sm:w-auto">
          {budget ? dict.continue : dict.continueWithout}
          <ArrowRightIcon />
        </Button>
      </div>
    </form>
  );
}
