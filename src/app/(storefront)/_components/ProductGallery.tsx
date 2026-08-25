"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import type { Product } from "@/app/_types/database.types";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { ProductPlaceholder } from "@/components/icons/ProductPlaceholder";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { SkeletonImage } from "@/components/ui/SkeletonImage";
import { useTranslations } from "@/i18n/use-translations";
import { productGallery } from "@/lib/products/gallery";

type Props = {
  product: Product;
  isSkeleton?: boolean;
  sizes: string;
  className?: string;
  imageClassName?: string;
  showThumbs?: boolean;
  /** "below" (default) stacks thumbs under the main image; "start" puts a
   * vertical thumb rail before the main image, side by side. */
  thumbsLayout?: "below" | "start";
};

export function ProductGallery({
  product,
  isSkeleton = false,
  sizes,
  className,
  imageClassName,
  showThumbs = false,
  thumbsLayout = "below",
}: Props) {
  const { t } = useTranslations();
  const images = productGallery(product);
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const current = images[Math.min(index, Math.max(images.length - 1, 0))] ?? null;
  const hasMultiple = images.length > 1;
  const rail = thumbsLayout === "start";

  function step(delta: number) {
    setIndex((current) => (current + delta + images.length) % images.length);
  }

  const thumbRail = showThumbs && hasMultiple && !isSkeleton && (
    <div
      className={cn(
        rail ? "flex flex-col gap-2" : "flex gap-2 overflow-x-auto",
      )}
    >
      {images.map((image, imageIndex) => (
        <button
          key={image.id}
          type="button"
          onClick={() => setIndex(imageIndex)}
          className={cn(
            "relative shrink-0 overflow-hidden rounded-[10px] border",
            rail ? "h-14 w-14" : "h-16 w-16",
            imageIndex === index
              ? rail
                ? "border-line-soft ring-2 ring-accent-gold"
                : "border-accent"
              : "border-border",
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
  );

  return (
    <div
      className={cn(
        rail ? "flex gap-3" : showThumbs ? "flex flex-col gap-3" : "relative h-full",
        className,
      )}
    >
      {rail && thumbRail}
      <div className={rail ? "flex flex-1 flex-col gap-2" : "contents"}>
      <div className={cn("relative", showThumbs ? "aspect-square overflow-hidden rounded-2xl" : "h-full w-full")}>
        {isSkeleton ? (
          <SkeletonImage className="absolute inset-0 p-8" />
        ) : current ? (
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            className="absolute inset-0 cursor-zoom-in"
            aria-label={t("product.zoom")}
          >
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
            <span className="absolute bottom-3 end-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
              <AppIcon icon={ZoomIn} size="sm" />
            </span>
          </button>
        ) : (
          <div className="flex h-full items-center justify-center">
            <ProductPlaceholder size="2xl" />
          </div>
        )}
        {hasMultiple && !isSkeleton && (
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

      {rail && hasMultiple && !isSkeleton && (
        <div className="flex items-center gap-2 text-[10.5px] text-text-faint">
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            className="text-accent-teal"
          >
            {t("product.zoom")}
          </button>
          <span className="font-mono ms-auto">
            {index + 1} / {images.length}
          </span>
        </div>
      )}

      {!rail && thumbRail}
      </div>

      {current && !isSkeleton ? (
        <Dialog.Root open={zoomOpen} onOpenChange={setZoomOpen}>
          <Dialog.Portal>
            <Dialog.Overlay
              className="fixed inset-0 bg-black/85 backdrop-blur-sm"
              style={{ zIndex: 100000 }}
            />
            <Dialog.Content
              className="fixed inset-0 flex flex-col"
              style={{ zIndex: 100001 }}
              aria-describedby={undefined}
            >
              <Dialog.Title className="sr-only">{product.name}</Dialog.Title>
              <div className="flex shrink-0 items-center justify-between p-4">
                <span className="text-sm text-white/80">
                  {hasMultiple ? `${index + 1} / ${images.length}` : product.name}
                </span>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                    aria-label={t("table.close")}
                  >
                    <AppIcon icon={X} size="md" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="relative min-h-0 flex-1">
                <StorefrontImage
                  src={current.image_url}
                  blurHash={current.blur_hash}
                  alt={product.name}
                  fill
                  sizes="100vw"
                  withBlur={false}
                  className="bg-transparent object-contain object-center"
                />
                {hasMultiple ? (
                  <>
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      className="absolute start-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 rtl:rotate-180"
                      aria-label="Previous"
                    >
                      <AppIcon icon={ChevronLeft} size="md" />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      className="absolute end-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 rtl:rotate-180"
                      aria-label="Next"
                    >
                      <AppIcon icon={ChevronRight} size="md" />
                    </button>
                  </>
                ) : null}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      ) : null}
    </div>
  );
}
