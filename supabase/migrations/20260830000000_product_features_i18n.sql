-- Multilingual product specifications/features (fa / ar / en)
ALTER TABLE public.product_features
  ADD COLUMN IF NOT EXISTS label_fa TEXT,
  ADD COLUMN IF NOT EXISTS label_ar TEXT,
  ADD COLUMN IF NOT EXISTS label_en TEXT,
  ADD COLUMN IF NOT EXISTS value_fa TEXT,
  ADD COLUMN IF NOT EXISTS value_ar TEXT,
  ADD COLUMN IF NOT EXISTS value_en TEXT;

UPDATE public.product_features
SET label_fa = label, label_ar = label, label_en = label,
    value_fa = value, value_ar = value, value_en = value
WHERE label_fa IS NULL;

ALTER TABLE public.product_features
  ALTER COLUMN label DROP NOT NULL,
  ALTER COLUMN value DROP NOT NULL;
