/**
 * The Carsea mark: a booklet cell holding a stamped "C".
 * The cell follows the text color; the stamp ring takes `--mark-ring`
 * when set (violet on pages) and otherwise matches the cell.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width="32"
      height="32"
      fill="none"
      aria-hidden
      className={className}
    >
      <rect x="1.5" y="1.5" width="29" height="29" stroke="currentColor" strokeWidth="2" />
      <path
        d="M22.6 11.2a8.2 8.2 0 1 0 0 9.6"
        stroke="var(--mark-ring, currentColor)"
        strokeWidth="3.4"
        transform="rotate(-12 16 16)"
      />
    </svg>
  );
}

export function Wordmark({
  className = "",
  ringOnPage = false,
}: {
  className?: string;
  /** On a page sheet the stamped C takes the stamp ink. */
  ringOnPage?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 ${ringOnPage ? "[--mark-ring:var(--stamp)]" : ""} ${className}`}
    >
      <Mark className="size-7 shrink-0" />
      <span className="type-display text-[1.375rem] leading-none tracking-[-0.03em]">
        Carsea
      </span>
    </span>
  );
}
