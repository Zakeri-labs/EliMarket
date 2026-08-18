"use client";

import Link from "next/link";
import { useCartStore } from "@/app/_store/cart-store";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCartStore();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">سبد خرید</h1>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center">
          <p className="text-zinc-500">سبد خرید شما خالی است.</p>
          <Link href="/" className="mt-4 inline-block text-emerald-700 hover:underline">
            بازگشت به فروشگاه
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between rounded-xl border border-zinc-200 p-4"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-zinc-500">
                  {item.price.toLocaleString("fa-IR")} {item.currency}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                >
                  −
                </Button>
                <span>{item.quantity}</span>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                >
                  +
                </Button>
                <Button type="button" variant="secondary" onClick={() => removeItem(item.productId)}>
                  حذف
                </Button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t pt-4">
            <span className="font-bold">
              جمع: {totalPrice().toLocaleString("fa-IR")} IRR
            </span>
            <Link href="/checkout">
              <Button type="button">ادامه و تسویه</Button>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
