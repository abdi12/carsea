import type { ReactNode } from "react";

export type StampKind = "verified" | "estimate" | "stale";

// Shape and wording carry the state; color never does so alone.
const kinds: Record<StampKind, string> = {
  verified: "border-2 border-stamp text-stamp outline outline-1 outline-offset-2 outline-stamp",
  estimate: "border-2 border-dashed border-ink text-ink",
  stale: "rounded-none border-2 border-ink-muted text-ink-muted",
};

export function Stamp({
  kind,
  children,
  className = "",
}: {
  kind: StampKind;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`type-label inline-block -rotate-[5deg] rounded-full px-3 py-1 ${kinds[kind]} ${className}`}
    >
      {children}
    </span>
  );
}
