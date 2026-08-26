-- User profile avatar: optimized WebP URL + BlurHash for placeholders
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS avatar_blur_hash TEXT;
