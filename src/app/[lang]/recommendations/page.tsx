import { Container, Notice, PageCover } from "@/components/page-parts";
import { Recommendations } from "@/components/recommendations";
import { getSummaries } from "@/lib/catalog";
import { pageContext, pageMetadata } from "@/lib/page";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[lang]/recommendations">) {
  const { lang, dict } = await pageContext(params);
  return pageMetadata(lang, "/recommendations", { title: dict.recs.title }, { index: false });
}

export default async function RecommendationsPage({ params }: PageProps<"/[lang]/recommendations">) {
  const { lang, dict } = await pageContext(params);
  const cars = await getSummaries();

  return (
    <main id="content">
      <PageCover title={dict.recs.title} lead={dict.recs.lead} />
      <Container className="py-10 sm:py-14">
        {cars.some((car) => car.sample) ? <Notice className="mb-6">{dict.provenance.sampleNotice}</Notice> : null}
        <Recommendations
          cars={cars}
          lang={lang}
          dict={{ recs: dict.recs, price: dict.price, actions: dict.actions, states: dict.states, labels: dict.labels }}
        />
      </Container>
    </main>
  );
}
