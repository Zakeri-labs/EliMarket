import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlugAction } from "@/app/_actions/product-actions";
import { AddToCartButton } from "@/app/(storefront)/_components/AddToCartButton";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductBySlugAction(slug);
  if (!result.success) return { title: "محصول" };
  return {
    title: result.data.name,
    description: result.data.description ?? undefined,
    openGraph: { title: result.data.name, images: result.data.image_url ? [result.data.image_url] : [] },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await getProductBySlugAction(slug);
  if (!result.success || !result.data) notFound();

  const product = result.data;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <Link href="/" className="mb-6 inline-block text-sm text-emerald-700 hover:underline">
        ← بازگشت به فروشگاه
      </Link>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl bg-zinc-100">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">بدون تصویر</div>
          )}
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {product.category && (
            <p className="text-sm text-zinc-500">دسته: {product.category.name}</p>
          )}
          <p className="text-2xl font-bold text-emerald-700">
            {Number(product.price).toLocaleString("fa-IR")} {product.currency}
          </p>
          <p className="leading-7 text-zinc-600">{product.description ?? "—"}</p>
          <p className="text-sm text-zinc-500">موجودی: {product.stock}</p>
          <AddToCartButton product={product} />
        </div>
      </div>
    </main>
  );
}
