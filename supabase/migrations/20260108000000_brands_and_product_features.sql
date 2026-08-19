-- Product brands + per-product features (specs)

CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.product_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_features_product_id_idx
  ON public.product_features (product_id);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY brands_select_all ON public.brands FOR SELECT USING (TRUE);
CREATE POLICY brands_admin_all ON public.brands FOR ALL USING (public.is_admin());

CREATE POLICY product_features_select_all ON public.product_features FOR SELECT USING (TRUE);
CREATE POLICY product_features_admin_all ON public.product_features FOR ALL USING (public.is_admin());
