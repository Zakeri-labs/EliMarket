-- Multilingual product descriptions (fa / ar / en)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS description_fa TEXT,
  ADD COLUMN IF NOT EXISTS description_ar TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT;

UPDATE public.products
SET description_fa = description
WHERE description IS NOT NULL
  AND description_fa IS NULL;
