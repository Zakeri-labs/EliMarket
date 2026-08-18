"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createAddressAction, getAddressesAction } from "@/app/_actions/address-actions";
import { createOrderAction } from "@/app/_actions/order-actions";
import { sendOtpAction, verifyOtpAction } from "@/app/_actions/auth-actions";
import { useCartStore } from "@/app/_store/cart-store";
import { useAuthStore } from "@/app/_store/auth-store";
import { useFormAction } from "@/app/hooks/use-form-action";
import { Button } from "@/components/ui/Button";
import type { Address } from "@/app/_types/database.types";

const DELIVERY_SLOTS = [
  "امروز ۱۴–۱۶",
  "امروز ۱۶–۱۸",
  "فردا ۱۰–۱۲",
  "فردا ۱۴–۱۶",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const { session, status, updateSession } = useAuthStore();
  const { isPending, runAction } = useFormAction();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState("");
  const [deliverySlot, setDeliverySlot] = useState(DELIVERY_SLOTS[0]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("cash");
  const [otpStep, setOtpStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

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
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <p>سبد خرید خالی است.</p>
        <Link href="/" className="mt-4 inline-block text-emerald-700">بازگشت</Link>
      </main>
    );
  }

  if (status !== "authenticated") {
    return (
      <main className="mx-auto max-w-md px-4 py-8">
        <h1 className="mb-4 text-xl font-bold">ورود برای تکمیل سفارش</h1>
        {otpStep === "phone" ? (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              runAction(() => sendOtpAction({ phone }), {
                successMessage: "کد تأیید ارسال شد",
                onSuccess: () => setOtpStep("code"),
              });
            }}
          >
            <input
              className="w-full rounded-md border px-3 py-2"
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
            />
            <Button type="submit" disabled={isPending}>دریافت کد</Button>
          </form>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              runAction(() => verifyOtpAction({ phone, token: otp }), {
                successMessage: "ورود موفق",
                onSuccess: async () => {
                  await updateSession();
                  setOtpStep("phone");
                },
              });
            }}
          >
            <input
              className="w-full rounded-md border px-3 py-2"
              placeholder="کد ۶ رقمی"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              dir="ltr"
            />
            <Button type="submit" disabled={isPending}>تأیید</Button>
          </form>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">تسویه حساب</h1>
      <p className="mb-4 text-sm text-zinc-500">سلام {session?.fullName ?? session?.phone}</p>

      <section className="mb-6 space-y-3 rounded-xl border p-4">
        <h2 className="font-semibold">آدرس تحویل</h2>
        {addresses.map((a) => (
          <label key={a.id} className="flex cursor-pointer items-start gap-2">
            <input
              type="radio"
              name="address"
              checked={addressId === a.id}
              onChange={() => setAddressId(a.id)}
            />
            <span>
              <strong>{a.label}</strong> — {a.address_line}
            </span>
          </label>
        ))}
        <form
          className="grid gap-2 border-t pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            runAction(
              () =>
                createAddressAction({
                  label: String(fd.get("label")),
                  address_line: String(fd.get("address_line")),
                  lat: Number(fd.get("lat") || 35.6892),
                  lng: Number(fd.get("lng") || 51.389),
                  is_default: true,
                }),
              {
                successMessage: "آدرس ثبت شد",
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
          <input name="label" placeholder="برچسب (منزل)" className="rounded border px-3 py-2" required />
          <input name="address_line" placeholder="آدرس کامل" className="rounded border px-3 py-2" required />
          <input name="lat" type="hidden" value="35.6892" />
          <input name="lng" type="hidden" value="51.389" />
          <Button type="submit" variant="secondary">افزودن آدرس</Button>
        </form>
      </section>

      <section className="mb-6 space-y-2 rounded-xl border p-4">
        <h2 className="font-semibold">زمان تحویل</h2>
        <select
          className="w-full rounded border px-3 py-2"
          value={deliverySlot}
          onChange={(e) => setDeliverySlot(e.target.value)}
        >
          {DELIVERY_SLOTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </section>

      <section className="mb-6 space-y-2 rounded-xl border p-4">
        <h2 className="font-semibold">روش پرداخت</h2>
        <label className="flex gap-2"><input type="radio" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} /> پرداخت در محل</label>
        <label className="flex gap-2"><input type="radio" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} /> آنلاین</label>
      </section>

      <div className="flex items-center justify-between">
        <span className="font-bold">{totalPrice().toLocaleString("fa-IR")} IRR</span>
        <Button
          type="button"
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
                successMessage: "سفارش ثبت شد",
                onSuccess: (order) => {
                  clearCart();
                  if (order?.id) router.push(`/orders/${order.id}`);
                },
              },
            )
          }
        >
          ثبت سفارش
        </Button>
      </div>
    </main>
  );
}
