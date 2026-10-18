-- Optional mobile/tablet hero banner artwork (separate crop, ~9:5).
-- Falls back to the regular image when empty.

ALTER TABLE public.hero_banners
  ADD COLUMN IF NOT EXISTS image_url_mobile TEXT,
  ADD COLUMN IF NOT EXISTS blur_hash_mobile TEXT;
