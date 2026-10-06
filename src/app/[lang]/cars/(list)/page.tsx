import { ButtonLink } from "@/components/button";
import { CarList } from "@/components/car-list";
import { Container, EmptySheet, Notice, PageCover } from "@/components/page-parts";
import { getSummaries } from "@/lib/catalog";
import { pageContext, pageMetadata } from "@/lib/page";

// The catalog is read per request; there is no database at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[lang]/cars">) {
  const { lang, dict } = await pageContext(params);
  return pageMetadata(lang, "/cars", { title: dict.cars.title, description: dict.cars.lead });
}

export default async function CarsPage({ params }: PageProps<"/[lang]/cars">) {
  const { lang, dict } = await pageContext(params);
  const cars = await getSummaries();

  return (
    <main id="content">
      <PageCover title={dict.cars.title} lead={dict.cars.lead} />
      <Container className="py-10 sm:py-14">
        {cars.length === 0 ? (
          <EmptySheet title={dict.cars.empty.title} body={dict.cars.empty.body}>
            <ButtonLink href={`/${lang}/guides`}>{dict.cars.empty.action}</ButtonLink>
          </EmptySheet>
        ) : (
          <>
            {cars.some((car) => car.sample) ? (
              <Notice className="mb-6">{dict.provenance.sampleNotice}</Notice>
            ) : null}
            <p className="mb-6 max-w-[70ch] text-ink-muted">{dict.cars.coverage}</p>
            <CarList
              cars={cars}
              lang={lang}
              dict={{
                cars: dict.cars,
                labels: dict.labels,
                price: dict.price,
                actions: dict.actions,
                budget: dict.budget,
                provenance: dict.provenance,
              }}
            />
          </>
        )}
      </Container>
    </main>
  );
}
