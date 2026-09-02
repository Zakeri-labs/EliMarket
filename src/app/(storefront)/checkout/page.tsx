"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Banknote,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Home,
  MapPin,
} from "lucide-react";
import {
  checkAddressCoverageAction,
  createAddressAction,
  deleteAddressAction,
  getAddressesAction,
  updateAddressAction,
} from "@/app/_actions/address-actions";
import { createOrderAction } from "@/app/_actions/order-actions";
import { sendOtpAction, verifyOtpAction } from "@/app/_actions/auth-actions";
import { useCartStore } from "@/app/_store/cart-store";
import { useAuthStore } from "@/app/_store/auth-store";
import { useStoreSettings } from "@/app/_hooks/use-store-settings";
import { useFormAction } from "@/app/hooks/use-form-action";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cartTotals, roundMoney } from "@/config/brand";
import { DEFAULT_MAP_CENTER } from "@/config/geo";
import type { Address } from "@/app/_types/database.types";
import { CartGate } from "@/app/(storefront)/_components/CartGate";
import { StorefrontBreadcrumbs } from "@/app/(storefront)/_components/StorefrontBreadcrumbs";
import { AppIcon } from "@/components/icons/AppIcon";
import { cn } from "@/app/utils/cn";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";
import "leaflet/dist/leaflet.css";

const AddressMapPicker = dynamic(
  () => import("@/app/(storefront)/checkout/_components/AddressMapPicker"),
  { ssr: false },
);

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-bg-card px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent-teal";

const sectionCard =
  "rounded-2xl border border-border-subtle bg-bg-card";

export default function CheckoutPage() {
  return (
    <CartGate>
      <CheckoutPageContent />
    </CartGate>
  );
}

function SectionHeader({
  title,
  onChange,
  changeLabel,
}: {
  title: string;
  onChange?: () => void;
  changeLabel: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 md:mb-4">
      <h2 className="text-sm font-semibold text-text-primary md:text-base">{title}</h2>
      {onChange ? (
        <button
          type="button"
          onClick={onChange}
          className="text-sm font-medium text-accent-gold md:text-[15px]"
        >
          {changeLabel}
        </button>
      ) : null}
    </div>
  );
}

function CheckoutPageContent() {
  const router = useRouter();
  const { items, totalPrice, clearCart, setSyncing } = useCartStore();
  const { status, session, updateSession } = useAuthStore();
  const { isPending, runAction } = useFormAction();
  const { t, messages, locale, dir } = useTranslations();
  const formatPrice = useFormatPrice();
  const { cashSurcharge } = useStoreSettings();

  const deliverySlots = messages.checkout.deliverySlots;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [lat, setLat] = useState<number>(DEFAULT_MAP_CENTER.lat);
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);
  const [lng, setLng] = useState<number>(DEFAULT_MAP_CENTER.lng);
  const [coverageOk, setCoverageOk] = useState<boolean | null>(null);
  const [deliverySlot, setDeliverySlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("online");
  const [otpStep, setOtpStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [editTimeOpen, setEditTimeOpen] = useState(false);

  const { subtotal, deliveryFee, vat, total } = useMemo(
    () => cartTotals(totalPrice()),
    [items, totalPrice],
  );

  const cashFee =
    paymentMethod === "cash" && cashSurcharge > 0 ? roundMoney(cashSurcharge) : 0;
  const grandTotal = roundMoney(total + cashFee);

  useEffect(() => {
    setDeliverySlot(deliverySlots[0] ?? "");
  }, [locale, deliverySlots]);

  useEffect(() => {
    if (status === "authenticated") {
      getAddressesAction().then((r) => {
        if (r.success && r.data) {
          setAddresses(r.data);
          const def = r.data.find((a) => a.is_default) ?? r.data[0];
          if (def) setAddressId(def.id);
          if (r.data.length === 0) setEditAddressOpen(true);
        }
      });
    }
  }, [status]);

  useEffect(() => {
    const selected = addresses.find((a) => a.id === addressId);
    if (!selected) {
      setCoverageOk(null);
      return;
    }
    checkAddressCoverageAction(selected.lat, selected.lng).then((r) => {
      if (r.success) setCoverageOk(r.data);
    });
  }, [addressId, addresses]);

  if (items.length === 0) {
    return (
      <main className="px-4 py-16 text-center" dir={dir}>
        <p className="text-text-secondary">{t("checkout.emptyCart")}</p>
        <Link href="/" className="mt-4 inline-block text-accent-teal">
          {t("checkout.back")}
        </Link>
      </main>
    );
  }

  if (status !== "authenticated") {
    return (
      <main className="mx-auto max-w-md px-4 py-6" dir={dir}>
        <Link href="/cart" className="mb-4 inline-block text-sm text-accent-teal">
          {t("checkout.backToCart")}
        </Link>
        <h1 className="mb-2 text-xl font-bold">{t("checkout.loginTitle")}</h1>
        <p className="mb-6 text-sm text-text-secondary">{t("checkout.loginSubtitle")}</p>
        {otpStep === "phone" ? (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              runAction(() => sendOtpAction({ phone }), {
                successMessage: t("notifications.otpSent"),
                onSuccess: () => setOtpStep("code"),
              });
            }}
          >
            <input
              className={inputClass}
              placeholder={t("checkout.phonePlaceholder")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
            />
            <Button type="submit" fullWidth loading={isPending} loadingLabel={t("common.processing")}>
              {t("checkout.getCode")}
            </Button>
          </form>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              runAction(() => verifyOtpAction({ phone, token: otp }), {
                successMessage: t("notifications.loginSuccess"),
                onSuccess: async () => {
                  await updateSession();
                  setOtpStep("phone");
                },
              });
            }}
          >
            <input
              className={inputClass}
              placeholder={t("checkout.otpPlaceholder")}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              dir="ltr"
            />
            {process.env.NEXT_PUBLIC_OTP_BYPASS_ENABLED !== "false" && (
              <p className="text-xs text-muted" dir="ltr">
                Temporary OTP — code:{" "}
                <strong>{process.env.NEXT_PUBLIC_OTP_BYPASS_CODE || "213141"}</strong>
              </p>
            )}
            <Button type="submit" fullWidth loading={isPending} loadingLabel={t("common.processing")}>
              {t("checkout.confirm")}
            </Button>
          </form>
        )}
      </main>
    );
  }

  const selectedAddress = addresses.find((a) => a.id === addressId);

  const resetForm = () => {
    setEditingId(null);
    setLabel("");
    setAddressLine("");
    setLat(DEFAULT_MAP_CENTER.lat);
    setLng(DEFAULT_MAP_CENTER.lng);
  };

  const startEdit = (address: Address) => {
    setEditingId(address.id);
    setLabel(address.label);
    setAddressLine(address.address_line);
    setLat(address.lat);
    setLng(address.lng);
    setEditAddressOpen(true);
  };

  const placeOrder = () => {
    setSyncing(true);
    runAction(
      () =>
        createOrderAction({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          addressId,
          deliverySlot,
          paymentMethod,
        }),
      {
        successMessage:
          paymentMethod === "online"
            ? t("checkout.paymentRedirecting")
            : t("notifications.orderPlaced"),
        onSuccess: (result) => {
          clearCart();
          if (result?.checkoutUrl) {
            window.location.href = result.checkoutUrl;
            return;
          }
          if (result?.order?.id) router.push(`/orders/${result.order.id}`);
        },
        onError: () => setSyncing(false),
        onSettled: () => setSyncing(false),
      },
    );
  };

  return (
    <main className="w-full pb-28 pt-3 md:pb-12 md:pt-8" dir={dir}>
      <StorefrontBreadcrumbs
        items={[
          { label: t("product.breadcrumbHome"), href: "/" },
          { label: t("cart.title"), href: "/cart" },
          { label: t("checkout.title") },
        ]}
      />
      {/* Header — matches mobile mock */}
      <div className="mb-5 flex items-center gap-3 md:mb-8">
        <Link
          href="/cart"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle bg-bg-card text-text-primary md:h-11 md:w-11"
          aria-label={t("checkout.backToCart")}
        >
          <AppIcon icon={ChevronLeft} size="sm" className="rtl:rotate-180" />
        </Link>
        <h1 className="text-xl font-bold text-text-primary md:text-2xl">{t("checkout.title")}</h1>
      </div>

      <div className="space-y-5 md:grid md:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] md:items-start md:gap-10 md:space-y-0 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14 xl:gap-16">
        <div className="space-y-5 md:space-y-7">
          {/* Address + time side-by-side on large screens */}
          <div className="space-y-5 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
          {/* Delivery address */}
          <section className={cn(editAddressOpen && "lg:col-span-2")}>
            <SectionHeader
              title={t("checkout.addressTitle")}
              changeLabel={t("checkout.change")}
              onChange={() => setEditAddressOpen((v) => !v)}
            />
            {selectedAddress && !editAddressOpen ? (
              <button
                type="button"
                onClick={() => setEditAddressOpen(true)}
                className={cn(sectionCard, "flex w-full items-center gap-3 p-3.5 text-start md:gap-4 md:p-5")}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-teal/15 text-accent-teal md:h-12 md:w-12">
                  <AppIcon icon={Home} size="sm" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-text-primary md:text-[15px]">
                    {selectedAddress.label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-text-secondary md:mt-1 md:text-sm md:whitespace-normal">
                    {selectedAddress.address_line}
                  </span>
                  {session?.phone ? (
                    <span className="mt-0.5 block text-xs text-text-secondary md:text-sm" dir="ltr">
                      {session.phone}
                    </span>
                  ) : null}
                  {coverageOk === false ? (
                    <span className="mt-1 block text-xs text-danger">
                      {t("checkout.outsideCoverage")}
                    </span>
                  ) : null}
                </span>
                <AppIcon
                  icon={ChevronRight}
                  size="sm"
                  className="shrink-0 text-text-secondary rtl:rotate-180"
                />
              </button>
            ) : !editAddressOpen ? (
              <button
                type="button"
                onClick={() => setEditAddressOpen(true)}
                className={cn(sectionCard, "flex w-full items-center gap-3 p-3.5 text-start md:gap-4 md:p-5")}
              >
                <AppIcon icon={MapPin} size="sm" className="text-accent-teal" />
                <span className="text-sm text-text-secondary">{t("checkout.noAddress")}</span>
              </button>
            ) : null}

            {editAddressOpen ? (
              <div className={cn(sectionCard, "mt-2 space-y-3 p-3.5 md:mt-3 md:p-5")}>
                {addresses.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 text-sm">
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="address"
                        checked={addressId === a.id}
                        onChange={() => {
                          setAddressId(a.id);
                          setEditAddressOpen(false);
                        }}
                        className="accent-accent-teal"
                      />
                      <span className="truncate">
                        <span className="font-medium text-text-primary">{a.label}</span>
                        <span className="ms-1 text-text-secondary">— {a.address_line}</span>
                      </span>
                    </label>
                    <button
                      type="button"
                      className="shrink-0 text-xs text-accent-gold"
                      onClick={() => startEdit(a)}
                    >
                      {t("checkout.editAddress")}
                    </button>
                    <button
                      type="button"
                      className="shrink-0 text-xs text-danger"
                      onClick={() => setDeleteAddressId(a.id)}
                    >
                      {t("checkout.deleteAddress")}
                    </button>
                  </div>
                ))}

                <form
                  className="grid gap-2 border-t border-border-subtle pt-3 md:gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const payload = {
                      label,
                      address_line: addressLine,
                      lat,
                      lng,
                      is_default: true,
                    };
                    if (editingId) {
                      runAction(() => updateAddressAction(editingId, payload), {
                        successMessage: t("notifications.addressUpdated"),
                        onSuccess: (addr) => {
                          if (addr) {
                            setAddresses((prev) =>
                              prev.map((row) => (row.id === addr.id ? addr : row)),
                            );
                            setAddressId(addr.id);
                          }
                          resetForm();
                          setEditAddressOpen(false);
                        },
                      });
                    } else {
                      runAction(() => createAddressAction(payload), {
                        successMessage: t("notifications.addressSaved"),
                        onSuccess: (addr) => {
                          if (addr) {
                            setAddresses((prev) => [addr, ...prev]);
                            setAddressId(addr.id);
                          }
                          resetForm();
                          setEditAddressOpen(false);
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
                  <p className="text-xs text-text-secondary">{t("checkout.pickOnMap")}</p>
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
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      loading={isPending}
                      loadingLabel={t("common.saving")}
                    >
                      {editingId ? t("checkout.saveAddress") : t("checkout.addAddress")}
                    </Button>
                    {addresses.length > 0 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          resetForm();
                          setEditAddressOpen(false);
                        }}
                      >
                        {t("common.cancel")}
                      </Button>
                    ) : null}
                  </div>
                </form>
              </div>
            ) : null}
          </section>

          {/* Delivery time */}
          <section>
            <SectionHeader
              title={t("checkout.deliveryTimeTitle")}
              changeLabel={t("checkout.change")}
              onChange={() => setEditTimeOpen((v) => !v)}
            />
            {!editTimeOpen ? (
              <button
                type="button"
                onClick={() => setEditTimeOpen(true)}
                className={cn(sectionCard, "flex w-full items-center gap-3 p-3.5 text-start md:gap-4 md:p-5")}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-teal/15 text-accent-teal md:h-12 md:w-12">
                  <AppIcon icon={Clock} size="sm" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-text-primary md:text-[15px]">
                  {deliverySlot || "—"}
                </span>
                <AppIcon
                  icon={ChevronRight}
                  size="sm"
                  className="shrink-0 text-text-secondary rtl:rotate-180"
                />
              </button>
            ) : (
              <div className={cn(sectionCard, "space-y-2 p-2 md:p-3")}>
                {deliverySlots.map((slot) => {
                  const selected = deliverySlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        setDeliverySlot(slot);
                        setEditTimeOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start text-sm md:px-4 md:py-3.5 md:text-[15px]",
                        selected
                          ? "bg-accent-teal/10 text-accent-teal"
                          : "text-text-primary hover:bg-bg-main",
                      )}
                    >
                      <AppIcon icon={Clock} size="sm" />
                      <span className="flex-1 font-medium">{slot}</span>
                      {selected ? <AppIcon icon={Check} size="sm" /> : null}
                    </button>
                  );
                })}
              </div>
            )}
          </section>
          </div>

          {/* Payment */}
          <section>
            <SectionHeader title={t("checkout.paymentTitle")} changeLabel={t("checkout.change")} />
            <div className="space-y-2 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              <label
                className={cn(
                  sectionCard,
                  "flex cursor-pointer items-center gap-3 p-3.5 md:gap-4 md:p-5",
                  paymentMethod === "online" && "border-accent-teal/60 bg-accent-teal/5",
                )}
              >
                <input
                  type="radio"
                  className="accent-accent-teal"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                />
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-main text-text-primary md:h-12 md:w-12">
                  <AppIcon icon={CreditCard} size="sm" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-text-primary md:text-[15px]">
                  {t("checkout.paymentOnline")}
                </span>
                {paymentMethod === "online" ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-teal text-on-accent">
                    <AppIcon icon={Check} size="xs" />
                  </span>
                ) : null}
              </label>
              <label
                className={cn(
                  sectionCard,
                  "flex cursor-pointer items-center gap-3 p-3.5 md:gap-4 md:p-5",
                  paymentMethod === "cash" && "border-accent-teal/60 bg-accent-teal/5",
                )}
              >
                <input
                  type="radio"
                  className="accent-accent-teal"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                />
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-main text-text-primary md:h-12 md:w-12">
                  <AppIcon icon={Banknote} size="sm" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-text-primary md:text-[15px]">
                  {t("checkout.paymentCash")}
                </span>
                {paymentMethod === "cash" ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-teal text-on-accent">
                    <AppIcon icon={Check} size="xs" />
                  </span>
                ) : null}
              </label>
            </div>
          </section>
        </div>

        {/* Summary + CTA */}
        <div className="space-y-4 md:sticky md:top-24">
          <section className={cn(sectionCard, "p-4 md:p-6")}>
            <h2 className="mb-3 text-sm font-semibold text-text-primary md:mb-5 md:text-base">
              {t("checkout.summaryTitle")}
            </h2>
            <div className="space-y-2.5 text-sm tabular-nums md:space-y-3.5 md:text-[15px]">
              <div className="flex justify-between text-text-secondary">
                <span>{t("checkout.subtotal")}</span>
                <span className="text-text-primary">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>{t("checkout.delivery")}</span>
                <span className="text-text-primary">
                  {deliveryFee === 0 ? t("common.free") : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>{t("checkout.vat")}</span>
                <span className="text-text-primary">{formatPrice(vat)}</span>
              </div>
              {cashFee > 0 ? (
                <div className="flex justify-between text-text-secondary">
                  <span>{t("checkout.cashFee")}</span>
                  <span className="text-text-primary">{formatPrice(cashFee)}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-border-subtle pt-3 text-base font-bold md:pt-4 md:text-lg">
                <span className="text-text-primary">{t("checkout.total")}</span>
                <span className="text-accent-teal">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </section>

          {/* Desktop CTA in column; mobile sticky below */}
          <div className="hidden lg:block">
            <Button
              type="button"
              fullWidth
              size="lg"
              loading={isPending}
              loadingLabel={t("common.processing")}
              disabled={!addressId || coverageOk === false}
              onClick={placeOrder}
              className="!h-12 !rounded-xl !bg-accent-teal !text-base !text-on-accent shadow-none"
            >
              {t("checkout.submitOrder", { price: formatPrice(grandTotal) })}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-bg-main/95 p-4 backdrop-blur lg:hidden">
        <Button
          type="button"
          fullWidth
          size="lg"
          loading={isPending}
          loadingLabel={t("common.processing")}
          disabled={!addressId || coverageOk === false}
          onClick={placeOrder}
          className="!rounded-xl !bg-accent-teal !text-on-accent shadow-none"
        >
          {t("checkout.submitOrder", { price: formatPrice(total) })}
        </Button>
      </div>

      <ConfirmDialog
        open={deleteAddressId !== null}
        title={t("common.confirmDeleteTitle")}
        description={t("common.confirmDelete")}
        confirmLabel={t("checkout.deleteAddress")}
        cancelLabel={t("common.cancel")}
        onOpenChange={(open) => {
          if (!open) setDeleteAddressId(null);
        }}
        onConfirm={() => {
          if (!deleteAddressId) return;
          const id = deleteAddressId;
          setDeleteAddressId(null);
          runAction(() => deleteAddressAction(id), {
            successMessage: t("notifications.addressDeleted"),
            onSuccess: () => {
              setAddresses((prev) => prev.filter((row) => row.id !== id));
              if (addressId === id) setAddressId("");
              if (editingId === id) resetForm();
            },
          });
        }}
      />
    </main>
  );
}
