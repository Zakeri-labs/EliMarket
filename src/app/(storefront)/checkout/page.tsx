"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Banknote,
  ChevronLeft,
  Clock,
  CreditCard,
  MapPin,
  Receipt,
} from "lucide-react";
import { createAddressAction, getAddressesAction } from "@/app/_actions/address-actions";
import { createOrderAction } from "@/app/_actions/order-actions";
import { sendOtpAction, verifyOtpAction } from "@/app/_actions/auth-actions";
import { useCartStore } from "@/app/_store/cart-store";
import { useAuthStore } from "@/app/_store/auth-store";
import { useFormAction } from "@/app/hooks/use-form-action";
import { Button } from "@/components/ui/Button";
import {
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  VAT_RATE,
} from "@/config/brand";
import type { Address } from "@/app/_types/database.types";
import { CartGate } from "@/app/(storefront)/_components/CartGate";
import { AppIcon } from "@/components/icons/AppIcon";
import { SectionHeading } from "@/components/icons/SectionHeading";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";

const inputClass =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm outline-none focus:border-accent";

const cardClass = "rounded-2xl border border-border bg-surface p-4";

export default function CheckoutPage() {
  return (
    <CartGate>
      <CheckoutPageContent />
    </CartGate>
  );
}

function CheckoutPageContent() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const { status, updateSession } = useAuthStore();
  const { isPending, runAction } = useFormAction();
  const { t, messages, locale } = useTranslations();
  const formatPrice = useFormatPrice();

  const deliverySlots = messages.checkout.deliverySlots;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("cash");
  const [otpStep, setOtpStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const subtotal = totalPrice();
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + deliveryFee + vat;

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
        }
      });
    }
  }, [status]);

  if (items.length === 0) {
    return (
      <main className="px-4 py-16 text-center">
        <p className="text-muted">{t("checkout.emptyCart")}</p>
        <Link href="/" className="mt-4 inline-block text-accent">{t("checkout.back")}</Link>
      </main>
    );
  }

  if (status !== "authenticated") {
    return (
      <main className="px-4 py-6">
        <Link href="/cart" className="mb-4 inline-block text-sm text-accent">{t("checkout.backToCart")}</Link>
        <h1 className="mb-2 text-xl font-bold">{t("checkout.loginTitle")}</h1>
        <p className="mb-6 text-sm text-muted">{t("checkout.loginSubtitle")}</p>
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
            <input className={inputClass} placeholder={t("checkout.phonePlaceholder")} value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
            <Button type="submit" fullWidth disabled={isPending}>{t("checkout.getCode")}</Button>
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
            <input className={inputClass} placeholder={t("checkout.otpPlaceholder")} value={otp} onChange={(e) => setOtp(e.target.value)} dir="ltr" />
            <Button type="submit" fullWidth disabled={isPending}>{t("checkout.confirm")}</Button>
          </form>
        )}
      </main>
    );
  }

  const selectedAddress = addresses.find((a) => a.id === addressId);

  return (
    <main className="space-y-4 py-4 pb-8 md:py-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:pb-12">
      <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-accent">
        <AppIcon icon={ChevronLeft} size="sm" className="rtl:rotate-180" />
        {t("checkout.backToCart")}
      </Link>
      <h1 className="text-xl font-bold">{t("checkout.title")}</h1>

      <section className={cardClass}>
        <div className="mb-3 flex items-center justify-between">
          <SectionHeading icon={MapPin}>{t("checkout.addressTitle")}</SectionHeading>
          <button type="button" className="text-xs text-accent">{t("checkout.change")}</button>
        </div>
        {selectedAddress ? (
          <p className="text-sm text-muted">
            <strong className="text-foreground">{selectedAddress.label}</strong>
            <br />
            {selectedAddress.address_line}
          </p>
        ) : (
          <p className="text-sm text-muted">{t("checkout.noAddress")}</p>
        )}
        {addresses.map((a) => (
          <label key={a.id} className="mt-2 flex cursor-pointer items-center gap-2 text-sm">
            <input type="radio" name="address" checked={addressId === a.id} onChange={() => setAddressId(a.id)} />
            {a.label}
          </label>
        ))}
        <form
          className="mt-3 grid gap-2 border-t border-border pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            runAction(
              () =>
                createAddressAction({
                  label: String(fd.get("label")),
                  address_line: String(fd.get("address_line")),
                  lat: 35.6892,
                  lng: 51.389,
                  is_default: true,
                }),
              {
                successMessage: t("notifications.addressSaved"),
                onSuccess: (addr) => {
                  if (addr) {
                    setAddresses((prev) => [addr, ...prev]);
                    setAddressId(addr.id);
                  }
                  e.currentTarget.reset();
                },
              },
            );
          }}
        >
          <input name="label" placeholder={t("checkout.labelPlaceholder")} className={inputClass} required />
          <input name="address_line" placeholder={t("checkout.addressPlaceholder")} className={inputClass} required />
          <Button type="submit" variant="secondary" size="sm">{t("checkout.addAddress")}</Button>
        </form>
      </section>

      <section className={cardClass}>
        <div className="mb-3 flex items-center justify-between">
          <SectionHeading icon={Clock}>{t("checkout.deliveryTimeTitle")}</SectionHeading>
        </div>
        <select className={inputClass} value={deliverySlot} onChange={(e) => setDeliverySlot(e.target.value)}>
          {deliverySlots.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </section>

      <section className={cardClass}>
        <SectionHeading icon={CreditCard} className="mb-3">{t("checkout.paymentTitle")}</SectionHeading>
        <label className={`mb-2 flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${paymentMethod === "online" ? "border-accent bg-accent/10" : "border-border"}`}>
          <input type="radio" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} />
          <AppIcon icon={CreditCard} size="sm" />
          <span className="text-sm">{t("checkout.paymentOnline")}</span>
        </label>
        <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${paymentMethod === "cash" ? "border-accent bg-accent/10" : "border-border"}`}>
          <input type="radio" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} />
          <AppIcon icon={Banknote} size="sm" />
          <span className="text-sm">{t("checkout.paymentCash")}</span>
        </label>
      </section>

      <section className={cardClass}>
        <SectionHeading icon={Receipt} className="mb-3">{t("checkout.summaryTitle")}</SectionHeading>
        <div className="space-y-2 text-sm text-muted">
          <div className="flex justify-between"><span>{t("checkout.subtotal")}</span><span>{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between"><span>{t("checkout.delivery")}</span><span>{deliveryFee === 0 ? t("common.free") : formatPrice(deliveryFee)}</span></div>
          <div className="flex justify-between"><span>{t("checkout.vat")}</span><span>{formatPrice(vat)}</span></div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-accent">
            <span>{t("checkout.total")}</span><span>{formatPrice(total)}</span>
          </div>
        </div>
      </section>

      <Button
        type="button"
        fullWidth
        size="lg"
        disabled={!addressId || isPending}
        onClick={() =>
          runAction(
            () =>
              createOrderAction({
                items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
                addressId,
                deliverySlot,
                paymentMethod,
              }),
            {
              successMessage: t("notifications.orderPlaced"),
              onSuccess: (order) => {
                clearCart();
                if (order?.id) router.push(`/orders/${order.id}`);
              },
            },
          )
        }
      >
        {t("checkout.submitOrder", { price: formatPrice(total) })}
      </Button>
    </main>
  );
}
