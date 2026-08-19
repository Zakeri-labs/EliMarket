"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductBySlugAction } from "@/app/_actions/product-actions";
import type { Product } from "@/app/_types/database.types";
import { ProductDetailClient } from "@/app/(storefront)/_components/ProductDetailClient";
import { mockProductDetail } from "@/app/(storefront)/_mocks/product-mock";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  slug: string;
  initialProduct: Product;
};

export function ProductDetailPageClient({ slug, initialProduct }: Props) {
  const { locale } = useTranslations();
  const { data: product, isFetching, isPending } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const result = await getProductBySlugAction(slug);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    initialData: initialProduct,
  });

  const isSkeleton =
    (isPending && !product) || (isFetching && product?.slug !== slug);
  const displayProduct = isSkeleton ? mockProductDetail(locale) : (product ?? initialProduct);

  return <ProductDetailClient product={displayProduct} isSkeleton={isSkeleton} />;
}
