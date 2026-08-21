"use client";

import { useState } from "react";
import type { Product } from "@/app/_types/database.types";
import { cn } from "@/app/utils/cn";
import { ProductPlaceholder } from "@/components/icons/ProductPlaceholder";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { SkeletonImage } from "@/components/ui/SkeletonImage";
import { productGallery } from "@/lib/products/gallery";

type Props = {
  product: Product;
  isSkeleton?: boolean;
  sizes: string;
  className?: string;
  imageClassName?: string;
  showThumbs?: boolean;
};

export function ProductGallery({
  product,
  isSkeleton = false,
  sizes,
  className,
  imageClassName,
  showThumbs = false,
}: Props) {
  const images = productGallery(product);
  const [index, setIndex] = useState(0);
  const current = images[Math.min(index, Math.max(images.length - 1, 0))] ?? null;

  return (
    <div className={cn(showThumbs ? "flex flex-col gap-3" : "relative h-full", className)}>
      <div className={cn("relative", showThumbs ? "aspect-square overflow-hidden rounded-2xl" : "h-full w-full")}>
        {isSkeleton ? (
          <SkeletonImage className="absolute inset-0 p-8" />
        ) : current ? (
          <StorefrontImage
            src={current.image_url}
            blurHash={current.blur_hash}
            alt={product.name}
            fill
            priority
            sizes={sizes}
            withBlur={false}
            className={cn("bg-transparent object-contain object-center", imageClassName)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ProductPlaceholder size="2xl" />
          </div>
        )}
        {images.length > 1 && !isSkeleton && (
          <div
            className={cn(
              "absolute inset-x-0 z-10 flex justify-center gap-1.5",
              showThumbs ? "bottom-4" : "bottom-8",
            )}
          >
            {images.map((image, imageIndex) => (
              <button
                key={image.id}
                type="button"
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  imageIndex === index ? "w-4 bg-white" : "w-1.5 bg-white/50",
                )}
                onClick={() => setIndex(imageIndex)}
                aria-label={`${imageIndex + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {showThumbs && images.length > 1 && !isSkeleton && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, imageIndex) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setIndex(imageIndex)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border",
                imageIndex === index ? "border-accent" : "border-border",
              )}
            >
              <StorefrontImage
                src={image.image_url}
                blurHash={image.blur_hash}
                alt=""
                fill
                sizes="64px"
                withBlur={false}
                className="bg-transparent object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
