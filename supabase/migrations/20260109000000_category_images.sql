-- Category cover images (managed from admin panel)
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS blur_hash TEXT;
