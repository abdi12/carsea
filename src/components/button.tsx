import Link from "next/link";
import type { ComponentProps } from "react";

const base =
  "type-label inline-flex min-h-12 items-center justify-center gap-2.5 px-5 transition-[background-color,color,translate] duration-150 ease-press active:translate-y-px";

const variants = {
  // The one filled action on a page sheet.
  primary: "bg-cover text-on-cover hover:bg-cover-deep",
  // On the green cover itself.
  onCover: "bg-on-cover text-cover hover:bg-surface",
  outline: "border-2 border-rule-strong text-ink hover:bg-ink hover:text-page",
} as const;

type Variant = keyof typeof variants;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
