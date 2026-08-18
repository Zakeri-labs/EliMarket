import type { Metadata } from "next";

/**
 * Admin route group — no public SEO metadata.
 * Pages under this group are behind proxy auth checks.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50">{children}</div>
  );
}
