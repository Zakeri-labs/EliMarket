import { StorefrontShell } from "@/app/(storefront)/_components/StorefrontShell";
import { getStoreSettingsAction } from "@/app/_actions/settings-actions";

export default async function StorefrontLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Read the price-visibility setting on the server so the very first paint
  // already knows whether prices are hidden. The client hook still refreshes
  // it, but without this the storefront would render prices and then strip
  // them once the client-side settings query resolves (a visible flash).
  const { data: settings } = await getStoreSettingsAction();

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      data-hide-prices={settings.show_prices ? undefined : ""}
    >
      <StorefrontShell>{children}</StorefrontShell>
    </div>
  );
}
