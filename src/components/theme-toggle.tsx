"use client";

import { useSyncExternalStore } from "react";

import { THEME_KEY } from "@/lib/theme";

import { MoonIcon, SunIcon } from "./icons";

type Theme = "light" | "dark";

const listeners = new Set<() => void>();

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
};

const readTheme = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

export function ThemeToggle({
  labels,
}: {
  labels: { toDark: string; toLight: string };
}) {
  // The inline script in the layout sets data-theme before paint.
  const theme = useSyncExternalStore<Theme>(subscribe, readTheme, () => "light");
  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => {
        document.documentElement.dataset.theme = next;
        try {
          window.localStorage.setItem(THEME_KEY, next);
        } catch {
          // Without storage the choice simply lasts for this page.
        }
        listeners.forEach((notify) => notify());
      }}
      aria-label={theme === "dark" ? labels.toLight : labels.toDark}
      title={theme === "dark" ? labels.toLight : labels.toDark}
      className="inline-flex size-11 items-center justify-center hover:bg-cover-rule"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
