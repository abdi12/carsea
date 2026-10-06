import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleBody } from "@/components/article";
import { Container, PageCover } from "@/components/page-parts";
import { getGuide, guideSlugs } from "@/content/guides";
import { locales } from "@/i18n/config";
import { fill, formatDate } from "@/lib/format";
import { pageContext, pageMetadata } from "@/lib/page";

type Props = PageProps<"/[lang]/guides/[slug]">;

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) => guideSlugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: Props) {
  const { lang } = await pageContext(params);
  const guide = getGuide(lang, (await params).slug);
  if (!guide) return {};
  return pageMetadata(lang, `/guides/${guide.slug}`, { title: guide.title, description: guide.summary });
}

export default async function GuidePage({ params }: Props) {
  const { lang, dict } = await pageContext(params);
  const guide = getGuide(lang, (await params).slug);
  if (!guide) notFound();

  return (
    <main id="content">
      <PageCover title={guide.title} lead={guide.summary}>
        <p className="mt-6">
          <Link href={`/${lang}/guides`} className="underline decoration-cover-rule hover:decoration-on-cover">
            {dict.guides.back}
          </Link>
        </p>
      </PageCover>
      <Container className="py-10 sm:py-14">
        <ArticleBody article={guide} />
        <p className="mt-12 max-w-[68ch] border-t border-rule pt-4 text-sm text-ink-muted">
          {fill(dict.guides.updated, { date: formatDate(guide.updated, lang) })} {dict.guides.note}
        </p>
      </Container>
    </main>
  );
}
