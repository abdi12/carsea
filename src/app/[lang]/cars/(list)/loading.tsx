"use client";

import { useParams } from "next/navigation";

import { Container, SkeletonSheet } from "@/components/page-parts";

/** Shown while this page reads the database. Keeps the page's shape. */
export default function Loading() {
  const label = useParams<{ lang: string }>().lang === "en" ? "Loading" : "Memuat";
  return (
    <main id="content">
      <div className="bg-cover">
        <Container className="py-12 sm:py-16">
          <div className="h-12 w-2/3 max-w-md bg-cover-deep sm:h-16" />
          <div className="mt-4 h-6 w-full max-w-xl bg-cover-deep" />
        </Container>
      </div>
      <Container className="py-10 sm:py-14">
        <SkeletonSheet rows={5} label={label} />
      </Container>
    </main>
  );
}
