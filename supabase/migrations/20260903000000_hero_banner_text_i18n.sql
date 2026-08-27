-- Per-language hero banner copy (fa / ar / en).
-- The legacy single-value columns (badge/title/subtitle/cta_label) are kept as
-- a final fallback; new writes fill the *_fa column from them.

ALTER TABLE public.hero_banners
  ADD COLUMN IF NOT EXISTS badge_fa TEXT,
  ADD COLUMN IF NOT EXISTS badge_ar TEXT,
  ADD COLUMN IF NOT EXISTS badge_en TEXT,
  ADD COLUMN IF NOT EXISTS title_fa TEXT,
  ADD COLUMN IF NOT EXISTS title_ar TEXT,
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS subtitle_fa TEXT,
  ADD COLUMN IF NOT EXISTS subtitle_ar TEXT,
  ADD COLUMN IF NOT EXISTS subtitle_en TEXT,
  ADD COLUMN IF NOT EXISTS cta_label_fa TEXT,
  ADD COLUMN IF NOT EXISTS cta_label_ar TEXT,
  ADD COLUMN IF NOT EXISTS cta_label_en TEXT;

-- Seed the Persian (default locale) columns from the existing single values.
UPDATE public.hero_banners
SET
  badge_fa = COALESCE(badge_fa, badge),
  title_fa = COALESCE(title_fa, title),
  subtitle_fa = COALESCE(subtitle_fa, subtitle),
  cta_label_fa = COALESCE(cta_label_fa, cta_label);
