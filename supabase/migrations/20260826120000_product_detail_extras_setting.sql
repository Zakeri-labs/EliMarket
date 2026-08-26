-- Optional extras on product detail: tabs (specs/reviews/Q&A/similar) + frequently bought together
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS show_product_detail_extras BOOLEAN NOT NULL DEFAULT TRUE;
