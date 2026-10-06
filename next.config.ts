import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image (SPEC §12).
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
