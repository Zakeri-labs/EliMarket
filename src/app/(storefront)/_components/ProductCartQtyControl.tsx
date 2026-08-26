"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import type { Product } from "@/app/_types/database.types";
import { useCartStore } from "@/app/_store/cart-store";
import { useCartEnabled } from "@/app/(storefront)/_components/CartGate";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { getNumberLocale } from "@/i18n/config";
import { useTranslations } from "@/i18n/use-translations";
import { productCover } from "@/lib/products/gallery";
import { notifyFormSuccess } from "@/app/utils/form-notify";

type Props = {
  product: Product;
  disabled?: boolean;
  className?: string;
};

export function ProductCartQtyControl({ product, disabled = false, className }: Props) {
  const { t, locale } = useTranslations();
  const { cartEnabled } = useCartEnabled();
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const quantity = useCartStore(
    (s) => s.items.find((i) => i.productId === product.id)?.quantity ?? 0,
  );

  if (!cartEnabled) return null;

  const inStock = product.stock > 0;
  const atMax = quantity >= product.stock;
  const cover = productCover(product);
  const qtyLabel = quantity.toLocaleString(getNumberLocale(locale));

  const stop = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const addOne = () => {
    if (disabled || !inStock) return;
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        currency: product.currency,
        imageUrl: cover?.image_url ?? product.image_url,
        blurHash: cover?.blur_hash ?? product.blur_hash,
        stock: product.stock,
      },
      1,
    );
    if (quantity === 0) {
      notifyFormSuccess(t("notifications.addedToCart"));
    }
  };

  if (quantity <= 0) {
    return (
      <button
        type="button"
        disabled={disabled || !inStock}
        aria-label={t("product.addToCartSimple")}
        onClick={(e) => {
          stop(e);
          addOne();
        }}
        onPointerDown={stop}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border border-accent-teal/50 bg-accent-teal text-on-accent shadow-sm transition-transform duration-200 ease-out",
          "hover:scale-110 active:scale-90",
          "disabled:pointer-events-none disabled:opacity-40 disabled:hover:scale-100",
          className,
        )}
      >
        <AppIcon icon={Plus} size="sm" />
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label={t("product.addToCartSimple")}
      onClick={stop}
      onPointerDown={stop}
      className={cn(
        "inline-flex h-8 items-center overflow-hidden rounded-full border border-accent-teal/40 bg-accent-teal/15 text-accent-teal shadow-sm",
        className,
      )}
    >
      <button
        type="button"
        disabled={disabled}
        aria-label={quantity <= 1 ? t("product.removeFromCart") : undefined}
        onClick={(e) => {
          stop(e);
          if (disabled) return;
          if (quantity <= 1) removeItem(product.id);
          else updateQuantity(product.id, quantity - 1);
        }}
        className="flex h-8 w-8 items-center justify-center hover:bg-accent-teal/20 disabled:opacity-40"
      >
        <AppIcon icon={quantity <= 1 ? Trash2 : Minus} size="xs" />
      </button>
      <span className="price-num min-w-6 px-0.5 text-center text-sm font-bold tabular-nums">
        {qtyLabel}
      </span>
      <button
        type="button"
        disabled={disabled || atMax}
        aria-label={t("product.addToCartSimple")}
        onClick={(e) => {
          stop(e);
          if (disabled || atMax) return;
          updateQuantity(product.id, quantity + 1);
        }}
        className="flex h-8 w-8 items-center justify-center transition-transform duration-200 ease-out hover:scale-110 hover:bg-accent-teal/20 active:scale-90 disabled:opacity-40 disabled:hover:scale-100"
      >
        <AppIcon icon={Plus} size="xs" />
      </button>
    </div>
  );
}
