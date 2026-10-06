import { ButtonLink } from "@/components/button";
import { Container, EmptySheet, Notice, PageCover } from "@/components/page-parts";
import { ServiceCentreList } from "@/components/service-centre-list";
import { getServiceCenters } from "@/lib/catalog";
import { pageContext, pageMetadata } from "@/lib/page";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[lang]/service-centres">) {
  const { lang, dict } = await pageContext(params);
  return pageMetadata(lang, "/service-centres", { title: dict.service.title, description: dict.service.lead });
}

export default async function ServiceCentresPage({ params }: PageProps<"/[lang]/service-centres">) {
  const { lang, dict } = await pageContext(params);
  const centres = await getServiceCenters();

  return (
    <main id="content">
      <PageCover title={dict.service.title} lead={dict.service.lead} />
      <Container className="py-10 sm:py-14">
        {centres.length === 0 ? (
          <EmptySheet title={dict.service.empty.title} body={dict.service.empty.body}>
            <ButtonLink href={`/${lang}/guides/warranty-and-service`}>{dict.service.empty.action}</ButtonLink>
          </EmptySheet>
        ) : (
          <>
            {centres.some((c) => c.source.kind === "sample") ? (
              <Notice className="mb-6">{dict.provenance.sampleNotice}</Notice>
            ) : null}
            <p className="mb-6 max-w-[70ch] text-ink-muted">{dict.service.coverage}</p>
            <ServiceCentreList centres={centres} lang={lang} dict={{ service: dict.service, provenance: dict.provenance }} />
          </>
        )}
      </Container>
    </main>
  );
}
