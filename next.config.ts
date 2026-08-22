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

function supabaseHost() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function buildCsp() {
  const supabase = supabaseHost();
  const supabaseHttps = supabase ? `https://${supabase}` : "";
  const supabaseWss = supabase ? `wss://${supabase}` : "";
  const isDev = process.env.NODE_ENV !== "production";

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // 'unsafe-eval' is required by React/Next's dev-mode debugging tools
    // (fast refresh, component stacks) and must never ship to production.
    "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https://images.unsplash.com",
      "https://*.tile.openstreetmap.org",
      ...(supabaseHttps ? [supabaseHttps] : []),
    ],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      ...(isDev ? ["ws://localhost:*"] : []),
      ...(supabaseHttps ? [supabaseHttps, supabaseWss] : []),
    ],
    "worker-src": ["'self'"],
    "manifest-src": ["'self'"],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
  };

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
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

    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(self)",
      },
      { key: "Content-Security-Policy", value: buildCsp() },
      ...(process.env.NODE_ENV === "production"
        ? [
            {
              key: "Strict-Transport-Security",
              value: "max-age=63072000; includeSubDomains; preload",
            },
          ]
        : []),
    ];

    const rules = [
      {
        source: "/:path*",
        headers: securityHeaders,
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

    // Dev builds reuse chunk filenames across recompiles (no content hash per
    // edit), so a 1-year immutable cache here makes the browser keep serving
    // JS from before your last change forever. Only safe once filenames are
    // truly content-hashed, i.e. a production build.
    if (process.env.NODE_ENV === "production") {
      rules.push(
        { source: "/icon.png", headers: longCache },
        { source: "/apple-icon.png", headers: longCache },
        { source: "/favicon.ico", headers: longCache },
        { source: "/_next/static/:path*", headers: longCache },
      );
    } else {
      // No Cache-Control at all still lets browsers apply heuristic freshness
      // (RFC 7234) and serve a stale copy of a dev chunk without a network
      // round-trip. Say so explicitly so every edit is guaranteed to show up.
      rules.push({
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      });
    }

    return rules;
  },
};

export default nextConfig;
