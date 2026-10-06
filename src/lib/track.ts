"use client";

import { useEffect } from "react";

import type { UsageEvent } from "@/domain/analytics";

/**
 * Counts one named action. Sends the event name only. Nothing is sent when
 * the browser signals Global Privacy Control or Do Not Track.
 */
export function track(event: UsageEvent) {
  if (typeof navigator === "undefined") return;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.globalPrivacyControl || nav.doNotTrack === "1") return;
  try {
    // sendBeacon survives the page navigating away.
    if (!nav.sendBeacon?.("/api/event", event)) {
      void fetch("/api/event", { method: "POST", body: event, keepalive: true });
    }
  } catch {
    // Counting is best-effort.
  }
}

/** Counts a page view once per mount. */
export function TrackView({ event }: { event: UsageEvent }) {
  useEffect(() => track(event), [event]);
  return null;
}
