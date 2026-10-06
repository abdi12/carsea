"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LOCALE_COOKIE,
  type Locale,
  locales,
  localizePathname,
} from "@/i18n/config";

export function LocaleSwitch({
  current,
  label,
  names,
}: {
  current: Locale;
  label: string;
  names: Record<Locale, string>;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={label}>
      <ul className="flex">
        {locales.map((locale) => (
          <li key={locale}>
            <Link
              href={localizePathname(pathname, locale)}
              hrefLang={locale}
              lang={locale}
              aria-label={names[locale]}
              aria-current={locale === current ? "true" : undefined}
              onClick={() => {
                // Remember a deliberate choice for the next unprefixed visit.
                document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
              }}
              className="type-label inline-flex h-11 min-w-10 items-center justify-center px-2 text-on-cover-muted hover:text-on-cover aria-[current=true]:text-on-cover aria-[current=true]:underline aria-[current=true]:decoration-2 aria-[current=true]:underline-offset-[0.4em]"
            >
              {locale}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
