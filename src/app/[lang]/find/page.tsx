import { Finder } from "@/components/finder";
import { Container, PageCover } from "@/components/page-parts";
import { pageContext, pageMetadata } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[lang]/find">) {
  const { lang, dict } = await pageContext(params);
  return pageMetadata(lang, "/find", { title: dict.find.title, description: dict.find.lead });
}

export default async function FindPage({ params }: PageProps<"/[lang]/find">) {
  const { lang, dict } = await pageContext(params);
  return (
    <main id="content">
      <PageCover title={dict.find.title} lead={dict.find.lead} />
      <Container className="py-10 sm:py-14">
        <Finder
          lang={lang}
          dict={{ find: dict.find, budget: dict.budget, labels: dict.labels, states: dict.states }}
        />
      </Container>
    </main>
  );
}
