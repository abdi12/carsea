import { ArticleBody } from "@/components/article";
import { Container, PageCover } from "@/components/page-parts";
import { methodology } from "@/content/methodology";
import { fill, formatDate } from "@/lib/format";
import { pageContext, pageMetadata } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[lang]/how-we-compare">) {
  const { lang } = await pageContext(params);
  const page = methodology[lang];
  return pageMetadata(lang, "/how-we-compare", { title: page.title, description: page.summary });
}

export default async function MethodologyPage({ params }: PageProps<"/[lang]/how-we-compare">) {
  const { lang, dict } = await pageContext(params);
  const page = methodology[lang];
  return (
    <main id="content">
      <PageCover title={page.title} lead={page.summary} />
      <Container className="py-10 sm:py-14">
        <ArticleBody article={page} />
        <p className="mt-12 max-w-[68ch] border-t border-rule pt-4 text-sm text-ink-muted">
          {fill(dict.guides.updated, { date: formatDate(page.updated, lang) })}
        </p>
      </Container>
    </main>
  );
}
