-- Replace full blur data URLs with compact BlurHash strings
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS blur_hash TEXT;

ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS hero_blur_hash TEXT;

ALTER TABLE public.products
  DROP COLUMN IF EXISTS blur_data_url;

ALTER TABLE public.store_settings
  DROP COLUMN IF EXISTS hero_blur_data_url;
