import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone is for Docker/self-host. Vercel 16.3 breaks when both adapter + standalone run.
  output: process.env.VERCEL ? undefined : "standalone",
  poweredByHeader: false,
};

export default nextConfig;
