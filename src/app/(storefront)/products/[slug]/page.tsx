import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlugAction } from "@/app/_actions/product-actions";
import { ProductDetailClient } from "@/app/(storefront)/_components/ProductDetailClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductBySlugAction(slug);
  if (!result.success) return { title: "محصول" };
  return {
    title: result.data.name,
    description: result.data.description ?? undefined,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await getProductBySlugAction(slug);
  if (!result.success || !result.data) notFound();
  return <ProductDetailClient product={result.data} />;
}
