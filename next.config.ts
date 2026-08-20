import type { NextConfig } from "next";

const canonicalHost = "eli-market-omega.vercel.app";

function supabaseRemotePattern() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];
  try {
    const { hostname } = new URL(url);
    return [
      {
        protocol: "https" as const,
        hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  // Standalone is for Docker/self-host. Vercel 16.3 breaks when both adapter + standalone run.
  output: process.env.VERCEL ? undefined : "standalone",
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Default 1MB blocks multipart image uploads through Server Actions.
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      ...supabaseRemotePattern(),
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: `www.${canonicalHost}` }],
        destination: `https://${canonicalHost}/:path*`,
        permanent: true,
      },
    ];
  },
  async headers() {
    const longCache = [
      {
        key: "Cache-Control",
        value: "public, max-age=31536000, immutable",
      },
    ];

    return [
      {
        source: "/icon.png",
        headers: longCache,
      },
      {
        source: "/apple-icon.png",
        headers: longCache,
      },
      {
        source: "/favicon.ico",
        headers: longCache,
      },
      {
        source: "/_next/static/:path*",
        headers: longCache,
      },
      {
        source: "/products/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
