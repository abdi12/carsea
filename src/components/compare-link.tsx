"use client";

import Link from "next/link";

import { fill } from "@/lib/format";
import { compareStore } from "@/lib/research-store";

/** The header's Compare link, carrying the current count for everyone. */
export function CompareLink({
  href,
  label,
  countLabel,
  className,
}: {
  href: string;
  label: string;
  /** e.g. "{count} cars in comparison" */
  countLabel: string;
  className?: string;
}) {
  const count = compareStore.use().length;
  return (
    <Link href={href} className={className}>
      {label}
      {count > 0 ? (
        <>
          <span aria-hidden className="type-label ml-2 inline-flex size-6 items-center justify-center rounded-full border-2 border-current text-[0.8125rem] no-underline">
            {count}
          </span>
          <span className="sr-only">, {fill(countLabel, { count })}</span>
        </>
      ) : null}
    </Link>
  );
}
