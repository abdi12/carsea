import Link from "next/link";
import { notFound } from "next/navigation";

import { CarActions } from "@/components/car-actions";
import { CostEstimator } from "@/components/cost-estimator";
import { Container, Notice, PageCover } from "@/components/page-parts";
import { PriceLine } from "@/components/price-line";
import { ProvenanceStamp, SourceNote } from "@/components/provenance";
import { featureCategories, featureDefinitions, featureKeys } from "@/domain/catalog";
import { variantName } from "@/domain/catalog-view";
import { getDetail, today } from "@/lib/catalog";
import { formatFact, formatWarranty } from "@/lib/fact-format";
import { fill, formatDate } from "@/lib/format";
import { pageContext, pageMetadata } from "@/lib/page";

export const dynamic = "force-dynamic";

type Props = PageProps<"/[lang]/cars/[id]">;

export async function generateMetadata({ params }: Props) {
  const { lang, dict } = await pageContext(params);
  const car = await getDetail((await params).id);
  if (!car) return {};
  return pageMetadata(
    lang,
    `/cars/${car.id}`,
    { title: `${variantName(car)} ${car.modelYear}`, description: dict.detail.description },
    // Sample data must never be indexed as if it described a real car.
    { index: !car.sample },
  );
}

const availabilityOrder = ["standard", "optional", "unavailable", "not_applicable"] as const;

export default async function CarPage({ params }: Props) {
  const { lang, dict } = await pageContext(params);
  const car = await getDetail((await params).id);
  if (!car) notFound();

  const d = dict.detail;
  const name = variantName(car);
  const specs = car.facts.filter((f) => !f.key.endsWith("_idr"));
  const heading = "type-display text-[clamp(1.5rem,3.6vw,2.25rem)]";

  return (
    <main id="content">
      <PageCover
        title={name}
        lead={[
          car.modelYear,
          dict.labels.bodyStyles[car.bodyStyle],
          dict.labels.powertrains[car.powertrain],
          dict.labels.transmissions[car.transmission],
        ].join(" · ")}
      >
        <p className="mt-6">
          <Link href={`/${lang}/cars`} className="underline decoration-cover-rule hover:decoration-on-cover">
            {d.back}
          </Link>
        </p>
      </PageCover>

      <Container className="py-10 sm:py-14">
        {car.sample ? <Notice className="mb-6">{dict.provenance.sampleNotice}</Notice> : null}

        <section aria-labelledby="price-heading" className="border border-rule-strong bg-surface">
          <div className="grid gap-x-10 gap-y-5 p-5 sm:p-7 md:grid-cols-[1fr_auto]">
            <div>
              <h2 id="price-heading" className="type-label text-ink-muted">
                {d.price.title}
              </h2>
              <div className="mt-2">
                <PriceLine price={car.price} lang={lang} dict={dict.price} size="text-[2rem]" />
              </div>
              {car.price ? (
                <>
                  <p className="mt-4">
                    <ProvenanceStamp item={car.price} source={car.sources[car.price.sourceId]} dict={dict.provenance} />
                  </p>
                  <p className="mt-4 max-w-[60ch] text-ink-muted">
                    {fill(car.price.validUntil ? d.price.validRange : d.price.validFrom, {
                      from: formatDate(car.price.validFrom, lang),
                      until: car.price.validUntil ? formatDate(car.price.validUntil, lang) : "",
                    })}{" "}
                    {car.price.inclusionsNote ?? d.price.noInclusions}
                  </p>
                  <SourceNote item={car.price} source={car.sources[car.price.sourceId]} lang={lang} dict={dict.provenance} className="mt-2" />
                </>
              ) : (
                <p className="mt-3 max-w-[60ch] text-ink-muted">{d.price.none}</p>
              )}
            </div>
            <CarActions id={car.id} name={name} lang={lang} dict={dict.actions} />
          </div>
        </section>

        <section aria-labelledby="specs-heading" className="mt-16">
          <h2 id="specs-heading" className={heading}>
            {d.specs.title}
          </h2>
          {specs.length === 0 ? (
            <p className="cell-empty mt-4 border border-rule-strong bg-surface p-5 text-ink-muted">{d.specs.none}</p>
          ) : (
            <dl className="mt-6 grid gap-px border border-rule-strong bg-rule sm:grid-cols-2 lg:grid-cols-4">
              {specs.map((fact) => (
                <div key={fact.key} className="flex flex-col bg-surface p-5 sm:min-h-48">
                  <dt className="type-label text-ink-muted">{dict.labels.facts[fact.key]}</dt>
                  <dd className="mt-2 flex flex-1 flex-col">
                    <span className="type-figure text-xl">{formatFact(fact, lang, dict.labels)}</span>
                    <span className="mt-3 block">
                      <ProvenanceStamp item={fact} source={car.sources[fact.sourceId]} dict={dict.provenance} />
                    </span>
                    <SourceNote item={fact} source={car.sources[fact.sourceId]} lang={lang} dict={dict.provenance} className="mt-auto pt-4" />
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        <section aria-labelledby="features-heading" className="mt-16">
          <div className="grid gap-x-12 gap-y-3 lg:grid-cols-[5fr_7fr]">
            <h2 id="features-heading" className={heading}>
              {d.features.title}
            </h2>
            <p className="max-w-[65ch] text-ink-muted lg:pt-1">{d.features.body}</p>
          </div>
          <div className="mt-6 grid gap-px border border-rule-strong bg-rule md:grid-cols-2">
            {featureCategories.map((category) => {
              const known = car.features.filter((f) => f.category === category);
              const unknown = featureKeys.filter(
                (key) => featureDefinitions[key] === category && !known.some((f) => f.key === key),
              );
              const standard = known.filter((f) => f.availability === "standard" && !f.stale).length;
              return (
                <div key={category} className="bg-surface p-5 sm:p-6">
                  <h3 className="type-title text-xl">{dict.labels.featureCategories[category]}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{fill(d.features.standardCount, { count: standard })}</p>
                  <dl className="mt-4">
                    {availabilityOrder.map((availability) => {
                      const items = known.filter((f) => f.availability === availability);
                      return items.length ? (
                        <div key={availability} className="border-t border-rule py-3">
                          <dt className="type-label text-ink-muted">{dict.labels.availability[availability]}</dt>
                          <dd className="mt-1">
                            {items
                              .map((f) => dict.labels.features[f.key] + (f.stale ? ` (${dict.provenance.stale.toLowerCase()})` : ""))
                              .join(", ")}
                          </dd>
                        </div>
                      ) : null;
                    })}
                    {unknown.length ? (
                      <div className="border-t border-rule py-3">
                        <dt className="type-label text-ink-muted">{d.features.unknown}</dt>
                        <dd className="mt-1 text-ink-muted">{unknown.map((key) => dict.labels.features[key]).join(", ")}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              );
            })}
          </div>
          {car.features[0] ? (
            <SourceNote item={car.features[0]} source={car.sources[car.features[0].sourceId]} lang={lang} dict={dict.provenance} className="mt-3" />
          ) : null}
        </section>

        <section aria-labelledby="cost-heading" className="mt-16">
          <div className="grid gap-x-12 gap-y-3 lg:grid-cols-[5fr_7fr]">
            <h2 id="cost-heading" className={heading}>
              {d.cost.title}
            </h2>
            <p className="max-w-[65ch] text-ink-muted lg:pt-1">{d.cost.body}</p>
          </div>
          <div className="mt-6">
            <CostEstimator
              inputs={car.costInputs}
              today={today()}
              lang={lang}
              sample={car.sample}
              dict={{ cost: dict.cost, provenance: dict.provenance }}
            />
          </div>
        </section>

        <section aria-labelledby="support-heading" className="mt-16">
          <h2 id="support-heading" className={heading}>
            {d.support.title}
          </h2>
          {car.warranties.length === 0 ? (
            <p className="cell-empty mt-4 border border-rule-strong bg-surface p-5 text-ink-muted">{d.support.noWarranty}</p>
          ) : (
            <dl className="mt-6 grid gap-px border border-rule-strong bg-rule sm:grid-cols-2">
              {car.warranties.map((w) => (
                <div key={w.coverage} className="flex flex-col bg-surface p-5 sm:p-6">
                  <dt className="type-label text-ink-muted">{dict.labels.coverage[w.coverage]}</dt>
                  <dd className="mt-2 flex flex-1 flex-col">
                    <span className="type-figure text-xl">{formatWarranty(w, lang, dict.labels)}</span>
                    {w.conditions ? <span className="mt-1 block text-ink-muted">{w.conditions}</span> : null}
                    <span className="mt-3 block">
                      <ProvenanceStamp item={w} source={car.sources[w.sourceId]} dict={dict.provenance} />
                    </span>
                    <SourceNote item={w} source={car.sources[w.sourceId]} lang={lang} dict={dict.provenance} className="mt-auto pt-4" />
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <p className="mt-5 max-w-[65ch]">
            {car.serviceCenterCount
              ? fill(d.support.centres, { count: car.serviceCenterCount, make: car.makeName })
              : fill(d.support.noCentres, { make: car.makeName })}{" "}
            <Link href={`/${lang}/service-centres`} className="underline">
              {d.support.centresLink}
            </Link>
          </p>
        </section>

        <section aria-labelledby="sources-heading" className="mt-16">
          <h2 id="sources-heading" className="type-title text-2xl">
            {d.sources.title}
          </h2>
          <ul className="mt-4 border-t border-rule">
            {Object.values(car.sources).map((source) => (
              <li key={source.id} className="border-b border-rule py-3">
                {source.url ? (
                  <a href={source.url} rel="noopener noreferrer" className="underline">
                    {source.title}
                  </a>
                ) : (
                  source.title
                )}
                <span className="text-ink-muted">
                  {" "}
                  · {source.publisher} · {dict.labels.sourceKinds[source.kind]} ·{" "}
                  {fill(d.sources.retrieved, { date: formatDate(source.retrievedOn, lang) })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </main>
  );
}
