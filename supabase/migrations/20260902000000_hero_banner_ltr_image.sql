-- Per-direction hero banner artwork.
-- `image_url` / `blur_hash` stay the RTL (fa/ar) + default image;
-- these hold the optional LTR (en) variant where the text block sits on
-- the opposite side, so the photo's negative space can be mirrored.

ALTER TABLE public.hero_banners
  ADD COLUMN IF NOT EXISTS image_url_ltr TEXT,
  ADD COLUMN IF NOT EXISTS blur_hash_ltr TEXT;
