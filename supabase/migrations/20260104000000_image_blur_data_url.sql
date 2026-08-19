-- Per-image blur placeholders (generated at upload time via plaiceholder/sharp)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS blur_data_url TEXT;

ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS hero_blur_data_url TEXT;
