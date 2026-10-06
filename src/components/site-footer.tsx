import Link from "next/link";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

import { Wordmark } from "./wordmark";

const links = [
  ["how-we-compare", "howWeCompare"],
  ["service-centres", "serviceCentres"],
  ["privacy", "privacy"],
  ["terms", "terms"],
] as const;

export function SiteFooter({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Wordmark className="text-ink" ringOnPage />
          <p className="mt-3 text-ink-muted">{dict.footer.tagline}</p>
        </div>
        <nav aria-label={dict.footer.label}>
          <ul className="grid grid-cols-2 gap-x-10 md:flex md:gap-x-8">
            {links.map(([path, key]) => (
              <li key={path}>
                <Link
                  href={`/${lang}/${path}`}
                  className="inline-flex min-h-11 items-center underline decoration-rule hover:decoration-ink"
                >
                  {dict.footer[key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
