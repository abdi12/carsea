import type { MetadataRoute } from "next";

import { guideSlugs } from "@/content/guides";
import { locales } from "@/i18n/config";
import { getSummaries } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const base = process.env.SITE_URL ?? "http://localhost:3000";

const staticPaths = [
  "",
  "/find",
  "/cars",
  "/guides",
  "/how-we-compare",
  "/service-centres",
  "/privacy",
  "/terms",
  ...guideSlugs.map((slug) => `/guides/${slug}`),
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Without a database the static pages are still listed.
  const cars = await getSummaries().catch(() => []);
  const paths = [
    ...staticPaths,
    // Sample cars are never offered to search engines.
    ...cars.filter((car) => !car.sample).map((car) => `/cars/${car.id}`),
  ];
  return paths.flatMap((path) =>
    locales.map((lang) => ({
      url: `${base}/${lang}${path}`,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}${path}`])),
      },
    })),
  );
}
