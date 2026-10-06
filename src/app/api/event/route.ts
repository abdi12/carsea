import { sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import { usageCounts } from "@/db/schema";
import { isUsageEvent } from "@/domain/analytics";
import { today } from "@/lib/catalog";

export const dynamic = "force-dynamic";

// Counts one named action. The request body is the event name and nothing
// else; no cookie is read or set and nothing about the caller is stored.

/** A ceiling on writes per second, so the endpoint cannot flood the table. */
const MAX_PER_SECOND = 50;
let windowStart = 0;
let windowCount = 0;

function allowed(): boolean {
  const second = Math.floor(Date.now() / 1000);
  if (second !== windowStart) {
    windowStart = second;
    windowCount = 0;
  }
  return ++windowCount <= MAX_PER_SECOND;
}

const noContent = () => new Response(null, { status: 204 });

export async function POST(request: Request) {
  const event = (await request.text()).slice(0, 64);
  if (!isUsageEvent(event)) return new Response(null, { status: 400 });
  if (!allowed()) return new Response(null, { status: 429 });

  try {
    await getDb()
      .insert(usageCounts)
      .values({ day: today(), event, count: 1 })
      .onConflictDoUpdate({
        target: [usageCounts.day, usageCounts.event],
        set: { count: sql`${usageCounts.count} + 1` },
      });
  } catch (error) {
    // Losing a count must never surface to the buyer.
    console.error("Usage count failed:", error);
  }
  return noContent();
}
