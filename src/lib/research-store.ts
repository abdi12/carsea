"use client";

import { useSyncExternalStore } from "react";

import { type FinderAnswers, parseFinderAnswers, parseIdList } from "@/domain/finder";

import { track } from "./track";

// Everything a buyer saves stays in their own browser (SPEC §6.4): finder
// answers, the comparison, and the shortlist. Nothing here is sent anywhere.
//
// Storage can be missing, blocked, or cleared. Each store then keeps working
// from memory for the visit, and `useStorageAvailable` lets the page say so.

export const MAX_COMPARE = 3;
const MAX_SAVED = 50;

let storageWorks: boolean | null = null;

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  if (storageWorks === false) return null;
  try {
    const probe = "carsea-probe";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    storageWorks = true;
    return window.localStorage;
  } catch {
    storageWorks = false;
    return null;
  }
}

function createStore<T>(key: string, empty: T, parse: (value: unknown) => T) {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cached: T = empty;
  // Used when storage is unavailable, so the visit still works.
  let memory: string | null = null;

  const readRaw = () => {
    const store = storage();
    if (!store) return memory;
    try {
      return store.getItem(key);
    } catch {
      return memory;
    }
  };

  const get = (): T => {
    const raw = readRaw();
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      try {
        cached = raw === null ? empty : parse(JSON.parse(raw));
      } catch {
        cached = empty;
      }
    }
    return cached;
  };

  const set = (value: T) => {
    const raw = JSON.stringify(value);
    memory = raw;
    try {
      storage()?.setItem(key, raw);
    } catch {
      // Quota or policy error: the in-memory copy carries the visit.
    }
    listeners.forEach((notify) => notify());
  };

  const clear = () => {
    memory = null;
    try {
      storage()?.removeItem(key);
    } catch {}
    listeners.forEach((notify) => notify());
  };

  const subscribe = (notify: () => void) => {
    listeners.add(notify);
    // Keep other tabs in step.
    const onStorage = (event: StorageEvent) => event.key === key && notify();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(notify);
      window.removeEventListener("storage", onStorage);
    };
  };

  const use = () => useSyncExternalStore(subscribe, get, () => empty);

  return { get, set, clear, use };
}

const EMPTY_ANSWERS: FinderAnswers = {};
const EMPTY_IDS: string[] = [];

export const finderStore = createStore("carsea-finder", EMPTY_ANSWERS, parseFinderAnswers);
export const compareStore = createStore("carsea-compare", EMPTY_IDS, (v) => parseIdList(v, MAX_COMPARE));
export const savedStore = createStore("carsea-saved", EMPTY_IDS, (v) => parseIdList(v, MAX_SAVED));

/** Adds or removes an id. Returns false when the comparison is full. */
export function toggleCompare(id: string): boolean {
  const ids = compareStore.get();
  if (ids.includes(id)) {
    compareStore.set(ids.filter((other) => other !== id));
    track("compare_remove");
    return true;
  }
  if (ids.length >= MAX_COMPARE) return false;
  compareStore.set([...ids, id]);
  track("compare_add");
  return true;
}

export function toggleSaved(id: string) {
  const ids = savedStore.get();
  savedStore.set(ids.includes(id) ? ids.filter((other) => other !== id) : [...ids, id].slice(-MAX_SAVED));
}

const noop = () => () => {};

/** False once we know the browser will not persist anything. */
export const useStorageAvailable = () =>
  useSyncExternalStore(
    noop,
    () => storage() !== null,
    () => true,
  );

/** True after hydration; lets client-only views avoid a mismatched first paint. */
export const useHydrated = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
