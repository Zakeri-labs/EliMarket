export type HeroSlide = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl?: string | null;
  blurHash?: string | null;
  /** Full-bleed banner graphic — hide text overlay when true */
  imageOnly?: boolean;
};
