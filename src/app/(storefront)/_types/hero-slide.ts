export type HeroSlide = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl?: string | null;
  blurHash?: string | null;
  /** Optional separate artwork for mobile/tablet (falls back to imageUrl). */
  mobileImageUrl?: string | null;
  mobileBlurHash?: string | null;
  /** Full-bleed banner graphic — hide text overlay when true */
  imageOnly?: boolean;
  /** Full-width photo with the text overlaid (vs. photo on one side). */
  fullBleed?: boolean;
};
