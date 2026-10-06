"use client";

import { useParams } from "next/navigation";

import { ButtonLink } from "@/components/button";
import { Container, EmptySheet } from "@/components/page-parts";

const copy = {
  id: {
    title: "Halaman tidak ditemukan.",
    body: "Alamat ini tidak ada, atau mobil ini sudah tidak ada di katalog.",
    home: "Ke beranda",
    cars: "Jelajahi mobil",
  },
  en: {
    title: "Page not found.",
    body: "This address does not exist, or this car is no longer in the catalog.",
    home: "Go to home",
    cars: "Browse cars",
  },
};

export default function NotFound() {
  const lang = useParams<{ lang: string }>().lang === "en" ? "en" : "id";
  const text = copy[lang];
  return (
    <main id="content">
      <Container className="py-16 sm:py-24">
        <EmptySheet title={text.title} body={text.body}>
          <ButtonLink href={`/${lang}`}>{text.home}</ButtonLink>
          <ButtonLink href={`/${lang}/cars`} variant="outline">
            {text.cars}
          </ButtonLink>
        </EmptySheet>
      </Container>
    </main>
  );
}
