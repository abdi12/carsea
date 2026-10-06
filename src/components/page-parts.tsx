import type { ReactNode } from "react";

/** The green cover band that opens every inner page. */
export function PageCover({ title, lead, children }: { title: string; lead?: string; children?: ReactNode }) {
  return (
    <section className="on-cover bg-cover text-on-cover">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <h1 className="type-display max-w-[20ch] text-[clamp(2rem,5.6vw,3.75rem)]">{title}</h1>
        {lead ? <p className="mt-4 max-w-[62ch] text-lg text-on-cover-muted">{lead}</p> : null}
        {children}
      </div>
    </section>
  );
}

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

/** A bordered booklet page. */
export function Sheet({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`border border-rule-strong bg-surface ${className}`}>{children}</div>;
}

/**
 * A hatched sheet for "nothing here": no catalog, no matches, no
 * selection. Always says why and offers the way forward.
 */
export function EmptySheet({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <div className="cell-empty border border-rule-strong bg-surface p-6 sm:p-10">
      <h2 className="type-title text-2xl">{title}</h2>
      <p className="mt-3 max-w-[60ch] text-lg text-ink-muted">{body}</p>
      {children ? <div className="mt-8 flex flex-wrap gap-3">{children}</div> : null}
    </div>
  );
}

/** A plain notice strip: sample data, storage unavailable, limited results. */
export function Notice({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`border border-dashed border-rule-strong bg-surface px-4 py-3 text-ink ${className}`}>
      {children}
    </p>
  );
}

/** Geometry-preserving placeholder while client-only state loads. */
export function SkeletonSheet({ rows = 4, label }: { rows?: number; label: string }) {
  return (
    <div role="status" aria-label={label} className="border border-rule bg-surface">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="border-b border-rule p-5 last:border-b-0 sm:p-6">
          <div className="h-5 w-2/5 bg-hatch" />
          <div className="mt-3 h-4 w-3/5 bg-hatch" />
        </div>
      ))}
    </div>
  );
}
