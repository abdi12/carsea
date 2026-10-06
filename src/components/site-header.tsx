import Link from "next/link";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

import { CompareLink } from "./compare-link";
import { MenuIcon } from "./icons";
import { LocaleSwitch } from "./locale-switch";
import { ThemeToggle } from "./theme-toggle";
import { Wordmark } from "./wordmark";

const links = ["find", "cars", "compare", "guides"] as const;

const desktopLink =
  "inline-flex h-11 items-center px-3.5 font-medium hover:underline hover:decoration-2 hover:underline-offset-[0.4em]";
const mobileLink = "flex min-h-12 items-center font-medium";

export function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    // Glass is reserved for this bar (SPEC §10): the cover tint stays dense
    // enough that light text keeps its contrast over white pages too.
    <header className="on-cover sticky top-0 z-20 border-b border-cover-rule bg-cover/94 text-on-cover backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-5 sm:px-8">
        <Link href={`/${lang}`} aria-label={dict.common.home} className="mr-auto">
          <Wordmark />
        </Link>

        <nav aria-label={dict.nav.label} className="hidden md:block">
          <ul className="flex">
            {links.map((key) => (
              <li key={key}>
                {key === "compare" ? (
                  <CompareLink
                    href={`/${lang}/compare`}
                    label={dict.nav.compare}
                    countLabel={dict.nav.compareCount}
                    className={desktopLink}
                  />
                ) : (
                  <Link href={`/${lang}/${key}`} className={desktopLink}>
                    {dict.nav[key]}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <LocaleSwitch
          current={lang}
          label={dict.localeSwitch.label}
          names={{ id: dict.localeSwitch.id, en: dict.localeSwitch.en }}
        />
        <ThemeToggle labels={dict.theme} />

        <details className="group md:hidden">
          <summary
            aria-label={dict.nav.menu}
            className="inline-flex size-11 cursor-pointer list-none items-center justify-center hover:bg-cover-rule [&::-webkit-details-marker]:hidden"
          >
            <MenuIcon />
          </summary>
          <nav
            aria-label={dict.nav.label}
            className="absolute inset-x-0 top-full border-b border-cover-rule bg-cover"
          >
            <ul className="mx-auto max-w-6xl px-5 py-2 sm:px-8">
              {links.map((key) => (
                <li key={key} className="border-b border-cover-rule last:border-b-0">
                  {key === "compare" ? (
                    <CompareLink
                      href={`/${lang}/compare`}
                      label={dict.nav.compare}
                      countLabel={dict.nav.compareCount}
                      className={mobileLink}
                    />
                  ) : (
                    <Link href={`/${lang}/${key}`} className={mobileLink}>
                      {dict.nav[key]}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}
