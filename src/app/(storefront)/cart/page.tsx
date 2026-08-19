"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2, Truck } from "lucide-react";
import { useCartStore } from "@/app/_store/cart-store";
import { CartGate } from "@/app/(storefront)/_components/CartGate";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/icons/AppIcon";
import { ProductPlaceholder } from "@/components/icons/ProductPlaceholder";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import {
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  VAT_RATE,
} from "@/config/brand";
import { cn } from "@/app/utils/cn";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";

function CartPageContent() {
  const { items, updateQuantity, removeItem, totalPrice, isSyncing } = useCartStore();
  const { t } = useTranslations();
  const formatPrice = useFormatPrice();
  const isSkeleton = isSyncing;

  const subtotal = totalPrice();
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + deliveryFee + vat;
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);

  return (
    <main className="py-4 md:py-6">
      <h1 className="mb-4 text-xl font-bold">{t("cart.title")}</h1>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
          <AppIcon icon={ShoppingCart} size="2xl" className="text-muted" />
          <p className="mt-4 text-muted">{t("cart.empty")}</p>
          <Link href="/" className="mt-4 text-accent text-sm">{t("cart.backToStore")}</Link>
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
              {remaining > 0 && (
                <div className="mb-4 rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center gap-2 text-xs">
                    <AppIcon icon={Truck} size="sm" className="text-accent" />
                    <span>
                      {t("cart.freeDeliveryProgress", {
                        amount: formatPrice(remaining),
                        highlight: t("cart.freeDeliveryHighlight"),
                      })}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-elevated">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <ul className="flex-1 space-y-3">
                {items.map((item) => (
                  <li
                    key={item.productId}
                    className={cn(
                      "flex gap-3 rounded-2xl border border-border bg-surface p-3",
                      isSkeleton && "skeleton pointer-events-none",
                    )}
                    aria-busy={isSkeleton}
                  >
                    <div className="target relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-elevated">
                      {item.imageUrl ? (
                        <StorefrontImage
                          src={item.imageUrl}
                          blurHash={item.blurHash}
                          alt=""
                          fill
                          sizes="64px"
                          withBlur={!isSkeleton}
                          className="object-cover"
                        />
                      ) : (
                        <ProductPlaceholder size="md" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-accent">{formatPrice(item.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isSkeleton}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-elevated"
                          onClick={() => {
                            if (isSkeleton) return;
                            updateQuantity(item.productId, item.quantity - 1);
                          }}
                        >
                          <AppIcon icon={Minus} size="xs" />
                        </button>
                        <span className="text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          disabled={isSkeleton}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-elevated"
                          onClick={() => {
                            if (isSkeleton) return;
                            updateQuantity(item.productId, item.quantity + 1);
                          }}
                        >
                          <AppIcon icon={Plus} size="xs" />
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isSkeleton}
                      className="text-muted hover:text-danger"
                      onClick={() => {
                        if (isSkeleton) return;
                        removeItem(item.productId);
                      }}
                    >
                      <AppIcon icon={Trash2} size="sm" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-1">
              <div className="space-y-2 rounded-2xl border border-border bg-surface p-4 text-sm lg:sticky lg:top-24">
                <div className="flex justify-between text-muted">
                  <span>{t("cart.subtotal")}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>{t("cart.deliveryFee")}</span>
                  <span>{deliveryFee === 0 ? t("cart.free") : formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>{t("cart.vat", { percent: Math.round(VAT_RATE * 100) })}</span>
                  <span>{formatPrice(vat)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 font-bold text-accent">
                  <span>{t("cart.total")}</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Link href="/checkout" className="mt-4 block">
                <Button type="button" fullWidth size="lg">{t("cart.continueCheckout")}</Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default function CartPage() {
  return (
    <CartGate>
      <CartPageContent />
    </CartGate>
  );
}
