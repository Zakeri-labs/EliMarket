import type { Metadata } from "next";
import { StorefrontShell } from "@/app/(storefront)/_components/StorefrontShell";
import { BRAND_NAME_FA } from "@/config/brand";

export const metadata: Metadata = {
  title: "فروشگاه",
  description: `خرید آنلاین — ${BRAND_NAME_FA}`,
  openGraph: {
    title: BRAND_NAME_FA,
    description: "خرید آنلاین با ارسال سریع",
    type: "website",
  },
};

export default function StorefrontLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <StorefrontShell>{children}</StorefrontShell>;
}
