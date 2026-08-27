import type { Product, ProductImage, ProductImageInput } from "@/app/_types/database.types";

export function productGallery(product: Product): ProductImage[] {
  if (product.images?.length) {
    return [...product.images].sort((a, b) => a.sort_order - b.sort_order);
  }
  if (!product.image_url) return [];
  return [
    {
      id: `${product.id}-cover`,
      product_id: product.id,
      image_url: product.image_url,
      blur_hash: product.blur_hash,
      sort_order: 0,
      is_primary: true,
      created_at: product.created_at,
    },
  ];
}

export function productCover(product: Product): ProductImage | null {
  const images = productGallery(product);
  return images.find((image) => image.is_primary) ?? images[0] ?? null;
}

/** Pick the cover image_url/blur_hash to store on a product row from a gallery input list. */
export function coverFromImageInputs(images?: ProductImageInput[]) {
  const first = images?.find((image) => image.image_url.trim());
  return {
    image_url: first?.image_url.trim() || null,
    blur_hash: first?.blur_hash?.trim() || null,
  };
}
