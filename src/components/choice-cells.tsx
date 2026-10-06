"use client";

import { CheckIcon } from "./icons";

export interface Choice<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

/**
 * A ruled row of selectable cells: the booklet's way of answering a
 * question. Single choice uses radios, multiple choice uses checkboxes,
 * and a chosen cell is stamped.
 */
export function ChoiceCells<T extends string>({
  name,
  choices,
  selected,
  multiple = false,
  onToggle,
  selectedLabel,
  columns = "grid-cols-2 lg:grid-cols-4",
}: {
  name: string;
  choices: Choice<T>[];
  selected: readonly T[];
  multiple?: boolean;
  onToggle: (value: T) => void;
  selectedLabel: string;
  columns?: string;
}) {
  return (
    // Hairline rules come from the gap over a rule-colored ground.
    <div className={`grid gap-px border-y border-rule bg-rule ${columns}`}>
      {choices.map((choice) => {
        const isSelected = selected.includes(choice.value);
        return (
          <label
            key={choice.value}
            className={`relative flex min-h-28 cursor-pointer flex-col justify-between gap-3 p-4 transition-colors duration-150 ease-press has-focus-visible:z-10 has-focus-visible:outline-3 has-focus-visible:outline-offset-[-3px] has-focus-visible:outline-[var(--focus)] sm:p-5 ${
              isSelected ? "bg-stamp-wash" : "bg-surface hover:bg-page"
            }`}
          >
            <input
              type={multiple ? "checkbox" : "radio"}
              name={name}
              value={choice.value}
              checked={isSelected}
              onChange={() => onToggle(choice.value)}
              // A chosen radio can be clicked again to clear it.
              onClick={() => !multiple && isSelected && onToggle(choice.value)}
              className="sr-only"
            />
            <span>
              <span className="type-figure block text-lg">{choice.label}</span>
              {choice.hint ? (
                <span className="mt-1 block text-sm text-ink-muted">{choice.hint}</span>
              ) : null}
            </span>
            <span className="flex h-8 items-center" aria-hidden>
              {isSelected ? (
                <span className="type-label inline-flex animate-stamp-press items-center gap-1.5 rounded-full border-2 border-stamp px-2.5 py-0.5 text-stamp outline outline-1 outline-offset-2 outline-stamp">
                  <CheckIcon width={14} height={14} strokeWidth={2.5} />
                  {selectedLabel}
                </span>
              ) : (
                <span
                  className={`size-5 border-2 border-rule ${multiple ? "" : "rounded-full"}`}
                />
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
