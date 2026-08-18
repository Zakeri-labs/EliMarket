"use client";

import { useProducts } from "@/app/(storefront)/_hooks/use-products";
import { ProductCard } from "@/app/(storefront)/_components/ProductCard";

export function ProductGrid() {
  const { data, isLoading, error } = useProducts();

  if (isLoading) {
    return <p className="text-zinc-500">در حال بارگذاری محصولات…</p>;
  }

  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error.message}
      </p>
    );
  }

  if (!data?.length) {
    return (
      <p className="text-zinc-500">محصولی یافت نشد. migration و seed را اجرا کنید.</p>
    );
  }

  const byCategory = data.reduce<Record<string, typeof data>>((acc, p) => {
    const key = p.category?.name ?? "سایر";
    acc[key] ??= [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      {Object.entries(byCategory).map(([category, products]) => (
        <section key={category}>
          <h2 className="mb-4 text-xl font-bold">{category}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
