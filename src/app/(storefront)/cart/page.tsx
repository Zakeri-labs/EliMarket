"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2, Truck } from "lucide-react";
import { useCartStore } from "@/app/_store/cart-store";
import { CartGate } from "@/app/(storefront)/_components/CartGate";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AppIcon } from "@/components/icons/AppIcon";
import { ProductPlaceholder } from "@/components/icons/ProductPlaceholder";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import {
  FREE_DELIVERY_THRESHOLD,
  VAT_RATE,
  cartTotals,
} from "@/config/brand";
import { cn } from "@/app/utils/cn";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";

function CartQtyStepper({
  quantity,
  disabled,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  disabled?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-xl border border-border bg-surface-elevated">
      <button
        type="button"
        disabled={disabled}
        className="flex h-9 w-9 items-center justify-center border-e border-border text-muted"
        onClick={onDecrease}
      >
        <AppIcon icon={Minus} size="xs" />
      </button>
      <span className="flex h-9 min-w-9 items-center justify-center px-1 text-sm font-semibold">
        {quantity}
      </span>
      <button
        type="button"
        disabled={disabled}
        className="flex h-9 w-9 items-center justify-center border-s border-border text-muted"
        onClick={onIncrease}
      >
        <AppIcon icon={Plus} size="xs" />
      </button>
    </div>
  );
}

function CartPageContent() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice, totalItems, isSyncing } =
    useCartStore();
  const { t, dir } = useTranslations();
  const formatPrice = useFormatPrice();
  const [pendingDelete, setPendingDelete] = useState<"all" | string | null>(null);
  const isSkeleton = isSyncing;
  const itemCount = totalItems();

  const subtotal = totalPrice();
  const { deliveryFee, vat, total } = cartTotals(subtotal);
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  const hasFreeDelivery = remaining === 0;

  if (items.length === 0) {
    return (
      <main className="flex flex-1 flex-col py-4 md:py-6" dir={dir}>
        <h1 className="mb-4 hidden text-xl font-bold md:block">{t("cart.title")}</h1>
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
          <AppIcon icon={ShoppingCart} size="2xl" className="text-muted" />
          <p className="mt-4 text-muted">{t("cart.empty")}</p>
          <Link href="/" className="mt-4 text-sm text-accent">
            {t("cart.backToStore")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col md:py-6" dir={dir}>
      {/* Mobile layout */}
      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-1">
          <h1 className="truncate text-base font-bold">
            {t("cart.titleWithCount", { count: itemCount })}
          </h1>
          <button
            type="button"
            disabled={isSkeleton}
            className="shrink-0 text-sm font-medium text-amber-500/90"
            onClick={() => {
              if (isSkeleton) return;
              setPendingDelete("all");
            }}
          >
            {t("cart.clear")}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-start text-sm leading-relaxed text-muted">
                  {hasFreeDelivery
                    ? t("cart.freeDeliveryUnlocked")
                    : t("cart.freeDeliveryProgress", {
                        amount: formatPrice(remaining),
                        highlight: t("cart.freeDeliveryHighlight"),
                      })}
                </p>
                <AppIcon icon={Truck} size="sm" className="mt-0.5 shrink-0 text-muted" />
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${hasFreeDelivery ? 100 : progress}%` }}
                />
              </div>
            </div>

            <ul>
              {items.map((item) => (
                <li
                  key={item.productId}
                  className={cn(
                    "border-b border-border px-4 py-4 last:border-b-0",
                    isSkeleton && "skeleton pointer-events-none",
                  )}
                  aria-busy={isSkeleton}
                >
                  <div className="flex gap-3">
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
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-start text-sm font-semibold leading-snug">
                            {item.name}
                          </p>
                          <p className="mt-2 text-start text-sm font-bold">
                            {formatPrice(item.price, item.currency)}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={isSkeleton}
                          className="shrink-0 text-muted hover:text-danger"
                          onClick={() => {
                            if (isSkeleton) return;
                            setPendingDelete(item.productId);
                          }}
                        >
                          <AppIcon icon={Trash2} size="sm" />
                        </button>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <CartQtyStepper
                          quantity={item.quantity}
                          disabled={isSkeleton}
                          onDecrease={() => {
                            if (isSkeleton) return;
                            updateQuantity(item.productId, item.quantity - 1);
                          }}
                          onIncrease={() => {
                            if (isSkeleton) return;
                            updateQuantity(item.productId, item.quantity + 1);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-2 border-t border-border p-4 text-sm">
              <div className="flex items-center justify-between text-muted">
                <span>{t("cart.subtotal")}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-muted">
                <span>{t("cart.deliveryFee")}</span>
                <span>{deliveryFee === 0 ? t("cart.free") : formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex items-center justify-between pt-1 font-bold">
                <span>{t("cart.total")}</span>
                <span className="text-accent">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-border bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Link href="/checkout">
            <Button type="button" fullWidth size="lg">
              {t("cart.continueCheckout")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:block">
        <h1 className="mb-4 text-xl font-bold">{t("cart.title")}</h1>
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            {!hasFreeDelivery && (
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

            <ul className="space-y-3">
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
                    <p className="text-xs text-accent">{formatPrice(item.price, item.currency)}</p>
                    <div className="mt-2">
                      <CartQtyStepper
                        quantity={item.quantity}
                        disabled={isSkeleton}
                        onDecrease={() => {
                          if (isSkeleton) return;
                          updateQuantity(item.productId, item.quantity - 1);
                        }}
                        onIncrease={() => {
                          if (isSkeleton) return;
                          updateQuantity(item.productId, item.quantity + 1);
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isSkeleton}
                    className="text-muted hover:text-danger"
                    onClick={() => {
                      if (isSkeleton) return;
                      setPendingDelete(item.productId);
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
              <Button type="button" fullWidth size="lg">
                {t("cart.continueCheckout")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={pendingDelete !== null}
        title={t("common.confirmDeleteTitle")}
        description={t("common.confirmDelete")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        onConfirm={() => {
          if (pendingDelete === "all") clearCart();
          else if (pendingDelete) removeItem(pendingDelete);
        }}
      />
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
