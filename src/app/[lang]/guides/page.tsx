import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";
import { Container, PageCover } from "@/components/page-parts";
import { guides } from "@/content/guides";
import { pageContext, pageMetadata } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[lang]/guides">) {
  const { lang, dict } = await pageContext(params);
  return pageMetadata(lang, "/guides", { title: dict.guides.title, description: dict.guides.lead });
}

export default async function GuidesPage({ params }: PageProps<"/[lang]/guides">) {
  const { lang, dict } = await pageContext(params);
  return (
    <main id="content">
      <PageCover title={dict.guides.title} lead={dict.guides.lead} />
      <Container className="py-10 sm:py-14">
        <ul className="border-t border-rule-strong">
          {guides[lang].map((guide) => (
            <li key={guide.slug} className="border-b border-rule">
              <Link
                href={`/${lang}/guides/${guide.slug}`}
                className="group grid items-center gap-x-12 gap-y-1 py-6 transition-colors duration-150 ease-press hover:bg-surface md:grid-cols-[5fr_6fr_1fr] md:px-4"
              >
                <h2 className="type-title text-xl group-hover:underline">{guide.title}</h2>
                <p className="max-w-[60ch] text-ink-muted">{guide.summary}</p>
                <ArrowRightIcon className="hidden justify-self-end text-accent transition-transform duration-150 ease-press group-hover:translate-x-1 md:block" />
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-[65ch] text-sm text-ink-muted">{dict.guides.note}</p>
      </Container>
    </main>
  );
}
