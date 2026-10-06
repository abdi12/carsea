import { ArticleBody } from "@/components/article";
import { Container, Notice, PageCover } from "@/components/page-parts";
import { privacy } from "@/content/legal";
import { fill, formatDate } from "@/lib/format";
import { pageContext, pageMetadata } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy">) {
  const { lang } = await pageContext(params);
  const page = privacy[lang];
  return pageMetadata(lang, "/privacy", { title: page.title, description: page.summary });
}

export default async function LegalPage({ params }: PageProps<"/[lang]/privacy">) {
  const { lang, dict } = await pageContext(params);
  const page = privacy[lang];
  return (
    <main id="content">
      <PageCover title={page.title} lead={page.summary} />
      <Container className="py-10 sm:py-14">
        <Notice className="mb-10 max-w-[68ch]">{dict.states.legalDraft}</Notice>
        <ArticleBody article={page} />
        <p className="mt-12 max-w-[68ch] border-t border-rule pt-4 text-sm text-ink-muted">
          {fill(dict.guides.updated, { date: formatDate(page.updated, lang) })}
        </p>
      </Container>
    </main>
  );
}
