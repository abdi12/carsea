import type { NextConfig } from "next";

// Next.js inlines its own bootstrap scripts, and the layout inlines the
// theme script, so scripts cannot be limited to 'self' without per-request
// nonces (which would force every page to render dynamically). Everything
// else is locked to this origin: no third-party scripts, frames, fonts,
// images, or connections can load.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Carsea never asks for location or device access (SPEC §12).
  { key: "Permissions-Policy", value: "geolocation=(), camera=(), microphone=(), payment=()" },
];

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image (SPEC §12).
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
