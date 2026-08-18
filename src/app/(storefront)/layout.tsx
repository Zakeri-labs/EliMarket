import type { Metadata } from "next";
import { StorefrontHeader } from "@/app/(storefront)/_components/StorefrontHeader";

export const metadata: Metadata = {
  title: "فروشگاه",
  description: "خرید آنلاین از سوپرمارکت",
  openGraph: {
    title: "سوپرمارکت",
    description: "خرید آنلاین با ارسال سریع",
    type: "website",
  },
};

export default function StorefrontLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <StorefrontHeader />
      {children}
    </div>
  );
}
