"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/button";
import { Container, EmptySheet } from "@/components/page-parts";

// Error boundaries are client components and receive no dictionary, so
// these few strings live here in both languages.
const copy = {
  id: {
    title: "Halaman ini gagal dimuat.",
    body: "Data katalog tidak bisa diambil saat ini. Panduan dan penjelasan metode tetap bisa dibaca.",
    retry: "Coba lagi",
    guides: "Buka panduan",
  },
  en: {
    title: "This page failed to load.",
    body: "Catalog data could not be fetched just now. The guides and the methodology can still be read.",
    retry: "Try again",
    guides: "Open the guides",
  },
};

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const lang = useParams<{ lang: string }>().lang === "en" ? "en" : "id";
  const text = copy[lang];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="content">
      <Container className="py-16 sm:py-24">
        <EmptySheet title={text.title} body={text.body}>
          <Button type="button" onClick={reset}>
            {text.retry}
          </Button>
          <ButtonLink href={`/${lang}/guides`} variant="outline">
            {text.guides}
          </ButtonLink>
        </EmptySheet>
      </Container>
    </main>
  );
}
