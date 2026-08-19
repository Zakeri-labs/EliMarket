-- Hero banner content (managed from admin panel)
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS hero_badge TEXT,
  ADD COLUMN IF NOT EXISTS hero_title TEXT,
  ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
  ADD COLUMN IF NOT EXISTS hero_cta_label TEXT,
  ADD COLUMN IF NOT EXISTS hero_cta_href TEXT DEFAULT '/categories',
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
