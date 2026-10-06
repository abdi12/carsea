import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

// Placeholder home until the Phase 2 design system and Phase 4 pages land.
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">
        {dict.home.heading}
      </h1>
      <p className="text-lg">{dict.home.lead}</p>
      <p>{dict.home.status}</p>
      <nav aria-label={dict.localeSwitch.label}>
        <ul className="flex gap-4">
          {locales.map((locale) => (
            <li key={locale}>
              <Link
                href={`/${locale}`}
                hrefLang={locale}
                lang={locale}
                aria-current={locale === lang ? "page" : undefined}
                className="underline underline-offset-4 aria-[current=page]:font-semibold aria-[current=page]:no-underline"
              >
                {dict.localeSwitch[locale]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
