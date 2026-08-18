"use client";

import type { Product } from "@/app/_types/database.types";
import { useCartStore } from "@/app/_store/cart-store";
import { Button } from "@/components/ui/Button";

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  return (
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
      disabled={product.stock <= 0}
    >
      {product.stock > 0 ? "افزودن به سبد" : "ناموجود"}
    </Button>
  );
}
