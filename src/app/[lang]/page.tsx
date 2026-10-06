import Link from "next/link";
import { notFound } from "next/navigation";

import { HomeBudget } from "@/components/home-budget";
import { ButtonLink } from "@/components/button";
import { ArrowRightIcon } from "@/components/icons";
import { Stamp, type StampKind } from "@/components/stamp";
import { guideSlugs } from "@/content/guides";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

const factCells = [
  { key: "price", stamp: "verified" },
  { key: "service", stamp: "estimate" },
  { key: "warranty", stamp: "stale" },
  { key: "insurance", stamp: null },
] as const satisfies readonly { key: string; stamp: StampKind | null }[];

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const { home } = dict;

  return (
    <main id="content">
      {/* The cover: green owns the whole opening region. */}
      <section className="on-cover relative bg-cover text-on-cover">
        {/* The sheet's cell columns continue up the cover as hairline rules. */}
        <div aria-hidden className="absolute inset-0 mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div className="grid h-full grid-cols-2 border-r border-cover-rule opacity-60 lg:grid-cols-5">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={`border-l border-cover-rule ${i > 1 ? "hidden lg:block" : ""}`}
              />
            ))}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-6xl px-5 pt-14 pb-40 sm:px-8 sm:pt-20 sm:pb-44">
          <h1 className="type-display max-w-[16ch] pl-4 sm:pl-6 text-[clamp(2.125rem,7.4vw,5.5rem)]">
            {home.heading}
          </h1>
          <p className="mt-6 max-w-[58ch] pl-4 text-lg text-on-cover-muted sm:pl-6 sm:text-xl">
            {home.lead}
          </p>
        </div>
      </section>

      {/* The first booklet page overlaps the cover's lower edge. */}
      <section className="mx-auto -mt-28 w-full max-w-6xl px-5 sm:px-8">
        <div className="border border-rule-strong bg-surface shadow-sheet">
          <HomeBudget action={`/${lang}/find`} dict={dict.budget} />
          <div className="flex flex-col gap-4 border-t border-rule-strong p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <h2 className="type-title text-lg">{home.browse.heading}</h2>
              <p className="mt-1 max-w-[60ch] text-ink-muted">{home.browse.body}</p>
            </div>
            <ButtonLink href={`/${lang}/cars`} variant="outline" className="shrink-0">
              {home.browse.action}
              <ArrowRightIcon />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* How a Carsea fact is recorded, shown rather than claimed. */}
      <section className="mx-auto w-full max-w-6xl px-5 pt-24 sm:px-8 sm:pt-32">
        <div className="grid gap-x-12 gap-y-6 lg:grid-cols-[5fr_7fr]">
          <h2 className="type-display text-[clamp(1.75rem,4.4vw,3rem)]">
            {home.facts.heading}
          </h2>
          <p className="max-w-[65ch] text-lg text-ink-muted lg:pt-2">{home.facts.body}</p>
        </div>

        <figure className="mt-10">
          <div className="border border-rule-strong bg-surface">
            <p className="type-label border-b border-rule-strong px-5 py-3 sm:px-6">
              {home.facts.vehicle}
            </p>
            <dl className="grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-4">
              {factCells.map(({ key, stamp }) => {
                const cell = home.facts.cells[key];
                return (
                  <div
                    key={key}
                    className={`flex flex-col bg-surface p-5 sm:min-h-56 sm:p-6 ${stamp ? "" : "cell-empty"}`}
                  >
                    <dt className="type-label text-ink-muted">{cell.label}</dt>
                    <dd className="mt-3 flex flex-1 flex-col">
                      <span
                        className={`type-figure text-[1.375rem] ${stamp ? "" : "text-ink-muted"}`}
                      >
                        {cell.value}
                      </span>
                      <span className="mt-4 block">
                        {stamp ? (
                          <Stamp kind={stamp}>{dict.stamps[stamp]}</Stamp>
                        ) : (
                          <span className="type-label text-ink-muted">
                            {dict.stamps.missing}
                          </span>
                        )}
                      </span>
                      <span className="mt-auto block pt-4 text-sm text-ink-muted sm:pt-5">
                        {cell.note}
                      </span>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
          <figcaption className="mt-3 text-sm text-ink-muted">
            {home.facts.caption}
          </figcaption>
        </figure>
      </section>

      {/* Independence: the second region the green owns outright. */}
      <section className="on-cover mt-24 bg-cover text-on-cover sm:mt-32">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <h2 className="type-display max-w-[18ch] text-[clamp(1.875rem,5.4vw,4rem)]">
            {home.independence.heading}
          </h2>
          <ul className="mt-12 border-t border-cover-rule">
            {home.independence.points.map((point) => (
              <li
                key={point.title}
                className="grid gap-x-12 gap-y-1 border-b border-cover-rule py-6 md:grid-cols-[5fr_7fr]"
              >
                <h3 className="type-title text-xl">{point.title}</h3>
                <p className="max-w-[60ch] text-lg text-on-cover-muted">{point.body}</p>
              </li>
            ))}
          </ul>
          <ButtonLink
            href={`/${lang}/how-we-compare`}
            variant="onCover"
            className="mt-10"
          >
            {home.independence.action}
            <ArrowRightIcon />
          </ButtonLink>
        </div>
      </section>

      {/* Research topics as an index, not a card grid. */}
      <section className="mx-auto w-full max-w-6xl px-5 pt-24 sm:px-8 sm:pt-32">
        <h2 className="type-display text-[clamp(1.75rem,4.4vw,3rem)]">
          {home.topics.heading}
        </h2>
        <ul className="mt-8 border-t border-rule-strong">
          {home.topics.items.map((item, index) => (
            <li key={item.title} className="border-b border-rule">
              <Link
                href={`/${lang}/guides/${guideSlugs[index] ?? ""}`}
                className="group grid items-center gap-x-12 gap-y-1 py-6 no-underline transition-colors duration-150 ease-press hover:bg-surface md:grid-cols-[5fr_6fr_1fr] md:px-4"
              >
                <h3 className="type-title text-xl group-hover:underline">{item.title}</h3>
                <p className="max-w-[60ch] text-ink-muted">{item.body}</p>
                <ArrowRightIcon className="hidden justify-self-end text-accent transition-transform duration-150 ease-press group-hover:translate-x-1 md:block" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* An honest close: what exists today and what does not. */}
      <section className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="max-w-3xl">
          <h2 className="type-title text-2xl sm:text-[1.75rem]">{home.close.heading}</h2>
          <p className="mt-3 max-w-[65ch] text-lg text-ink-muted">{home.close.body}</p>
        </div>
      </section>
    </main>
  );
}
