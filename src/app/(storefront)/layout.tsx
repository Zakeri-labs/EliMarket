import { StorefrontShell } from "@/app/(storefront)/_components/StorefrontShell";

export default function StorefrontLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <StorefrontShell>{children}</StorefrontShell>
    </div>
  );
}
