"use client";

import Image, { type ImageProps, type StaticImageData } from "next/image";
import { resolveBlurDataUrl } from "@/lib/images/blurhash-data-url";
import {
  IMAGE_BLUR_DATA_URL,
  resolveStaticImagePath,
} from "@/lib/images/blur-placeholders";
import { cn } from "@/app/utils/cn";

type StorefrontImageProps = Omit<
  ImageProps,
  "src" | "placeholder" | "blurDataURL"
> & {
  src: string | StaticImageData | null | undefined;
  /** Compact BlurHash from DB; decoded to blurDataURL at render time. */
  blurHash?: string | null;
  /** Legacy precomputed data URL — do not pass to DOM (stripped here). */
  blurDataUrl?: string | null;
  withBlur?: boolean;
  wrapperClassName?: string;
};

function isStaticImport(
  src: string | StaticImageData,
): src is StaticImageData {
  return typeof src === "object" && src !== null && "src" in src;
}

export function StorefrontImage({
  src,
  blurHash,
  blurDataUrl,
  withBlur = true,
  alt,
  className,
  wrapperClassName,
  fill,
  width,
  height,
  ...props
}: StorefrontImageProps) {
  if (!src) return null;

  const resolvedStatic =
    typeof src === "string" ? resolveStaticImagePath(src) : null;
  const imageSrc: string | StaticImageData = resolvedStatic
    ?? (isStaticImport(src) ? src : src);
  const useStaticBlur =
    withBlur && (isStaticImport(imageSrc) || resolvedStatic !== null);

  const remoteBlurDataUrl =
    blurDataUrl ??
    resolveBlurDataUrl(blurHash, IMAGE_BLUR_DATA_URL);

  const image = (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      placeholder={withBlur ? "blur" : undefined}
      blurDataURL={
        withBlur && !useStaticBlur ? remoteBlurDataUrl : undefined
      }
    />
  );

  if (fill) {
    return (
      <span
        className={cn("relative block h-full w-full overflow-hidden", wrapperClassName)}
      >
        {image}
      </span>
    );
  }

  return image;
}
