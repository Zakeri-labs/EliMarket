import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Standalone chrome-free shell for printable documents (thermal receipts, etc.).
// Deliberately outside the (admin) group so it does not inherit the fixed
// full-screen admin layout, which breaks paged print output.
export default function PrintLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh bg-white text-black">{children}</div>
  );
}
