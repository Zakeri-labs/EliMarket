"use client";

import Link from "next/link";
import type { Product } from "@/app/_types/database.types";
import { useCartStore } from "@/app/_store/cart-store";
import { Button } from "@/components/ui/Button";

type Props = { product: Product };

export function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square bg-zinc-100">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">
              بدون تصویر
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold">{product.name}</h3>
        </Link>
        <p className="text-sm text-zinc-500 line-clamp-2">
          {product.description ?? "—"}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="font-bold text-emerald-700">
            {Number(product.price).toLocaleString("fa-IR")} {product.currency}
          </span>
          <Button
            type="button"
            onClick={() =>
              addItem({
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: Number(product.price),
                currency: product.currency,
                imageUrl: product.image_url,
              })
            }
          >
            افزودن
          </Button>
        </div>
      </div>
    </article>
  );
}
