-- Multilingual product names (fa / ar / en)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS name_fa TEXT,
  ADD COLUMN IF NOT EXISTS name_ar TEXT,
  ADD COLUMN IF NOT EXISTS name_en TEXT;

UPDATE public.products
SET name_fa = name
WHERE name_fa IS NULL;
