"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { checkAddressCoverageAction, createAddressAction } from "@/app/_actions/address-actions";
import { useAddresses } from "@/app/(storefront)/_hooks/use-addresses";
import { useAuthStore } from "@/app/_store/auth-store";
import { useFormAction } from "@/app/hooks/use-form-action";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/icons/AppIcon";
import { DEFAULT_MAP_CENTER } from "@/config/geo";
import { useTranslations } from "@/i18n/use-translations";
import "leaflet/dist/leaflet.css";

const AddressMapPicker = dynamic(
  () => import("@/app/(storefront)/checkout/_components/AddressMapPicker"),
  { ssr: false },
);

const inputClass =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm outline-none focus:border-accent";

// Pages that already run their own address-collection flow inline.
const EXCLUDED_PATHS = ["/addresses", "/checkout"];

export function AddressGateModal() {
  const pathname = usePathname();
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.session?.id);
  const { data: addresses, isSuccess, isFetching } = useAddresses();
  const { t, dir, locale } = useTranslations();
  const { isPending, runAction } = useFormAction();
  const queryClient = useQueryClient();

  const [dismissed, setDismissed] = useState(false);
  const [label, setLabel] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [lat, setLat] = useState<number>(DEFAULT_MAP_CENTER.lat);
  const [lng, setLng] = useState<number>(DEFAULT_MAP_CENTER.lng);
  const [coverageOk, setCoverageOk] = useState<boolean | null>(null);

  // Reset dismiss only on logout; after login wait for a fresh address fetch.
  useEffect(() => {
    if (status !== "authenticated") {
      setDismissed(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && userId) {
      void queryClient.invalidateQueries({ queryKey: ["addresses"] });
    }
  }, [status, userId, queryClient]);

  const isExcludedPath = EXCLUDED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  // Only ask when we KNOW the user has zero saved addresses.
  // Do not open while loading / refetching / before a successful fetch.
  const hasNoSavedAddress = isSuccess && !isFetching && (addresses?.length ?? 0) === 0;

  const open =
    status === "authenticated" &&
    hasNoSavedAddress &&
    !dismissed &&
    !isExcludedPath;

  useEffect(() => {
    if (!open) return;
    checkAddressCoverageAction(lat, lng).then((r) => {
      if (r.success) setCoverageOk(r.data);
    });
  }, [open, lat, lng]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverageOk) return;
    runAction(
      () =>
        createAddressAction({
          label,
          address_line: addressLine,
          lat,
          lng,
          is_default: true,
        }),
      {
        successMessage: t("notifications.addressSaved"),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["addresses"] });
          setDismissed(true);
        },
      },
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={(next) => setDismissed(!next)}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0"
          style={{ zIndex: 100050, background: "rgba(15, 23, 18, 0.55)", backdropFilter: "blur(6px)" }}
        />
        <Dialog.Content
          dir={dir}
          className="fixed max-h-[90vh] w-[min(28rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl border border-border bg-surface p-5"
          style={{ zIndex: 100051, left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
        >
          <div className="mb-3 flex items-center gap-2">
            <AppIcon icon={MapPin} size="sm" className="text-accent" />
            <Dialog.Title className="text-lg font-bold">{t("addressGate.title")}</Dialog.Title>
          </div>
          <Dialog.Description className="mb-4 text-sm text-muted">
            {t("addressGate.description")}
          </Dialog.Description>

          <form className="grid gap-2" onSubmit={handleSubmit}>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t("checkout.labelPlaceholder")}
              className={inputClass}
              required
            />
            <input
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder={t("checkout.addressPlaceholder")}
              className={inputClass}
              required
            />
            <p className="text-xs text-muted">{t("checkout.pickOnMap")}</p>
            <AddressMapPicker
              lat={lat}
              lng={lng}
              lang={locale}
              resolvingLabel={t("checkout.resolvingAddress")}
              onChange={(nextLat, nextLng) => {
                setLat(nextLat);
                setLng(nextLng);
              }}
              onResolveAddress={setAddressLine}
            />
            {coverageOk === false && (
              <p className="text-sm text-red-400">{t("checkout.outsideCoverage")}</p>
            )}
            {coverageOk === true && (
              <p className="text-sm text-accent">{t("checkout.coverageOk")}</p>
            )}
            <div className="mt-2 flex gap-2">
              <Button
                type="submit"
                fullWidth
                disabled={!coverageOk}
                loading={isPending}
                loadingLabel={t("common.saving")}
              >
                {t("checkout.saveAddress")}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setDismissed(true)}>
                {t("addressGate.later")}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
