import type { SVGProps } from "react";

// One stroke weight and cap style for every icon in the system.
const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "square",
  strokeLinejoin: "miter",
  "aria-hidden": true,
} as const;

type IconProps = SVGProps<SVGSVGElement>;

export const ArrowRightIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M3 10h13M11 5l5 5-5 5" />
  </svg>
);

export const CheckIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M4 10.5l4 4 8-9" />
  </svg>
);

export const MenuIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M3 6h14M3 10h14M3 14h14" />
  </svg>
);

export const SunIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="10" cy="10" r="3.25" />
    <path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4" />
  </svg>
);

export const MoonIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M16 11.5A6.5 6.5 0 0 1 8.5 4a6.5 6.5 0 1 0 7.5 7.5z" />
  </svg>
);
