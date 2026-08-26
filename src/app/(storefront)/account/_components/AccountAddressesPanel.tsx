"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin, Pencil, Star, Trash2 } from "lucide-react";
import {
  createAddressAction,
  deleteAddressAction,
  updateAddressAction,
} from "@/app/_actions/address-actions";
import { useAddresses } from "@/app/(storefront)/_hooks/use-addresses";
import { useFormAction } from "@/app/hooks/use-form-action";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AppIcon } from "@/components/icons/AppIcon";
import { DEFAULT_MAP_CENTER } from "@/config/geo";
import type { Address } from "@/app/_types/database.types";
import { useTranslations } from "@/i18n/use-translations";
import "leaflet/dist/leaflet.css";

const AddressMapPicker = dynamic(
  () => import("@/app/(storefront)/checkout/_components/AddressMapPicker"),
  { ssr: false },
);

const inputClass =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm outline-none focus:border-accent";

export function AccountAddressesPanel() {
  const { data: addresses, isPending } = useAddresses();
  const { t } = useTranslations();
  const { isPending: isSaving, runAction } = useFormAction();
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [lat, setLat] = useState<number>(DEFAULT_MAP_CENTER.lat);
  const [lng, setLng] = useState<number>(DEFAULT_MAP_CENTER.lng);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setFormOpen(false);
    setLabel("");
    setAddressLine("");
    setLat(DEFAULT_MAP_CENTER.lat);
    setLng(DEFAULT_MAP_CENTER.lng);
  };

  const startEdit = (address: Address) => {
    setEditingId(address.id);
    setFormOpen(true);
    setLabel(address.label);
    setAddressLine(address.address_line);
    setLat(address.lat);
    setLng(address.lng);
  };

  const startNew = () => {
    setEditingId(null);
    setFormOpen(true);
    setLabel("");
    setAddressLine("");
    setLat(DEFAULT_MAP_CENTER.lat);
    setLng(DEFAULT_MAP_CENTER.lng);
  };

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["addresses"] });

  const setAsDefault = (address: Address) => {
    runAction(
      () =>
        updateAddressAction(address.id, {
          label: address.label,
          address_line: address.address_line,
          lat: address.lat,
          lng: address.lng,
          is_default: true,
        }),
      { onSuccess: invalidate },
    );
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold md:text-xl">{t("account.addressesTitle")}</h2>
        {!formOpen ? (
          <Button type="button" variant="outline" size="sm" onClick={startNew}>
            {t("account.addNewAddress")}
          </Button>
        ) : null}
      </div>

      {isPending ? (
        <p className="text-sm text-muted">{t("common.loading")}</p>
      ) : !addresses?.length && !formOpen ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted">{t("account.noAddressesYet")}</p>
          <Button type="button" variant="outline" className="mt-4" onClick={startNew}>
            {t("account.addNewAddress")}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses?.map((address) => (
            <div key={address.id} className="rounded-2xl border border-border bg-surface p-4 md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AppIcon icon={MapPin} size="sm" className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold md:text-[15px]">
                      {address.label}
                      {address.is_default ? (
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
                          {t("account.defaultBadge")}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">{address.address_line}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-foreground"
                    aria-label={t("checkout.editAddress")}
                    onClick={() => startEdit(address)}
                  >
                    <AppIcon icon={Pencil} size="xs" />
                  </button>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:text-danger/80"
                    aria-label={t("checkout.deleteAddress")}
                    onClick={() => setDeleteId(address.id)}
                  >
                    <AppIcon icon={Trash2} size="xs" />
                  </button>
                </div>
              </div>
              {!address.is_default ? (
                <button
                  type="button"
                  className="mt-3 flex items-center gap-1.5 text-xs font-medium text-accent"
                  onClick={() => setAsDefault(address)}
                >
                  <AppIcon icon={Star} size="xs" />
                  {t("account.setDefault")}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {formOpen ? (
        <form
          className="mt-4 grid gap-2 rounded-2xl border border-border bg-surface p-4 md:p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const payload = {
              label,
              address_line: addressLine,
              lat,
              lng,
              is_default: !addresses?.length,
            };
            if (editingId) {
              runAction(() => updateAddressAction(editingId, payload), {
                successMessage: t("notifications.addressUpdated"),
                onSuccess: () => {
                  invalidate();
                  resetForm();
                },
              });
            } else {
              runAction(() => createAddressAction(payload), {
                successMessage: t("notifications.addressSaved"),
                onSuccess: () => {
                  invalidate();
                  resetForm();
                },
              });
            }
          }}
        >
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
            onChange={(nextLat, nextLng) => {
              setLat(nextLat);
              setLng(nextLng);
            }}
          />
          <div className="flex gap-2">
            <Button type="submit" variant="secondary" loading={isSaving} loadingLabel={t("common.saving")}>
              {editingId ? t("checkout.saveAddress") : t("checkout.addAddress")}
            </Button>
            <Button type="button" variant="ghost" onClick={resetForm}>
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      ) : null}

      <ConfirmDialog
        open={deleteId !== null}
        title={t("common.confirmDeleteTitle")}
        description={t("common.confirmDelete")}
        confirmLabel={t("checkout.deleteAddress")}
        cancelLabel={t("common.cancel")}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        onConfirm={() => {
          if (!deleteId) return;
          const id = deleteId;
          setDeleteId(null);
          runAction(() => deleteAddressAction(id), {
            successMessage: t("notifications.addressDeleted"),
            onSuccess: () => {
              invalidate();
              if (editingId === id) resetForm();
            },
          });
        }}
      />
    </div>
  );
}
