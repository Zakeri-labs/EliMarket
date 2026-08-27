-- Background AI product generation: track per-product status + link
-- completion notifications back to the product.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS generation_status TEXT,
  ADD COLUMN IF NOT EXISTS generation_error TEXT;

ALTER TABLE public.admin_notifications
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;
