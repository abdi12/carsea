import { Comparison } from "@/components/comparison";
import { Container, PageCover } from "@/components/page-parts";
import { pageContext, pageMetadata } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[lang]/compare">) {
  const { lang, dict } = await pageContext(params);
  return pageMetadata(lang, "/compare", { title: dict.compare.title }, { index: false });
}

export default async function ComparePage({ params }: PageProps<"/[lang]/compare">) {
  const { lang, dict } = await pageContext(params);
  return (
    <main id="content">
      <PageCover title={dict.compare.title} lead={dict.compare.lead} />
      <Container className="py-10 sm:py-14">
        <Comparison
          lang={lang}
          dict={{
            compare: dict.compare,
            labels: dict.labels,
            price: dict.price,
            cost: dict.cost,
            provenance: dict.provenance,
            states: dict.states,
            actions: dict.actions,
          }}
        />
      </Container>
    </main>
  );
}
