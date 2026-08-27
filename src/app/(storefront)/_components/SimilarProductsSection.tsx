"use client";

import { useMemo } from "react";
import { useProducts } from "@/app/(storefront)/_hooks/use-products";
import { ProductDealCard } from "@/app/(storefront)/_components/ProductDealCard";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  categoryId: string | null;
  excludeProductId: string;
  limit?: number;
};

export function SimilarProductsSection({ categoryId, excludeProductId, limit = 10 }: Props) {
  const { t } = useTranslations();
  const { data: products, isPending } = useProducts();

  const items = useMemo(() => {
    if (!categoryId || !products) return [];
    return products
      .filter((product) => product.category_id === categoryId && product.id !== excludeProductId)
      .slice(0, limit);
  }, [products, categoryId, excludeProductId, limit]);

  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: Math.min(limit, 4) }).map((_, index) => (
          <ProductDealCard key={index} product={PLACEHOLDER} isSkeleton layout="grid" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">{t("product.noSimilarProducts")}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((product) => (
        <ProductDealCard key={product.id} product={product} layout="grid" />
      ))}
    </div>
  );
}

const PLACEHOLDER = {
  id: "placeholder",
  category_id: null,
  brand_id: null,
  name: "",
  name_fa: null,
  name_ar: null,
  name_en: null,
  slug: "",
  description: null,
  description_fa: null,
  description_ar: null,
  description_en: null,
  price: 0,
  compare_at_price: null,
  currency: "OMR",
  stock: 0,
  inventory_unit: "count" as const,
  low_stock_threshold: 0,
  image_url: null,
  blur_hash: null,
  is_active: true,
  created_at: "",
  sku: null,
  parent_product_id: null,
  variant_label: null,
  generation_status: null,
  generation_error: null,
};
