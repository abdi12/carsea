import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { THEME_KEY } from "@/lib/theme";

import "../globals.css";

// One variable family at two extremes: expanded for titles, condensed for
// stamps and labels. The width axis carries the whole type system.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
  // The generated fallback only fits the regular width. globals.css
  // defines width-matched fallbacks for each type role instead.
  adjustFontFallback: false,
});

// Light is the default; only a saved choice switches to dark, and it is
// applied before first paint so the page never flashes the wrong theme.
const themeScript = `try{if(localStorage.getItem(${JSON.stringify(THEME_KEY)})==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const dict = await getDictionary(lang);
  return {
    // Set SITE_URL at build time so canonical and alternate links are absolute.
    metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`${archivo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#content"
          className="type-label sr-only z-30 bg-surface px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          {dict.common.skipToContent}
        </a>
        <SiteHeader lang={lang} dict={dict} />
        <div className="flex-1">{children}</div>
        <SiteFooter lang={lang} dict={dict} />
      </body>
    </html>
  );
}
