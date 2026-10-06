import type { MetadataRoute } from "next";

const base = process.env.SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Buyer-specific views and data endpoints are not content (SPEC §5).
      disallow: ["/api/", "/*/recommendations", "/*/compare"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
