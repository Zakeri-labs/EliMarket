import { StorefrontShell } from "@/app/(storefront)/_components/StorefrontShell";

export default function StorefrontLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <StorefrontShell>{children}</StorefrontShell>;
}
