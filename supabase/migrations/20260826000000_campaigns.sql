-- Timed discounts, special sales, and homepage campaigns

CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percent', 'fixed')),
  discount_value NUMERIC(12, 3) NOT NULL CHECK (discount_value > 0),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  show_on_home BOOLEAN NOT NULL DEFAULT TRUE,
  badge TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT campaigns_window_chk CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS campaigns_live_idx
  ON public.campaigns (is_active, starts_at, ends_at);

CREATE TABLE IF NOT EXISTS public.campaign_products (
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sale_price NUMERIC(12, 3) CHECK (sale_price IS NULL OR sale_price >= 0),
  PRIMARY KEY (campaign_id, product_id)
);

CREATE INDEX IF NOT EXISTS campaign_products_product_idx
  ON public.campaign_products (product_id);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS campaigns_select_all ON public.campaigns;
CREATE POLICY campaigns_select_all ON public.campaigns
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS campaigns_admin_all ON public.campaigns;
CREATE POLICY campaigns_admin_all ON public.campaigns
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS campaign_products_select_all ON public.campaign_products;
CREATE POLICY campaign_products_select_all ON public.campaign_products
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS campaign_products_admin_all ON public.campaign_products;
CREATE POLICY campaign_products_admin_all ON public.campaign_products
  FOR ALL USING (public.is_admin());

GRANT SELECT ON TABLE public.campaigns TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.campaigns TO authenticated;
GRANT ALL ON TABLE public.campaigns TO service_role;

GRANT SELECT ON TABLE public.campaign_products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.campaign_products TO authenticated;
GRANT ALL ON TABLE public.campaign_products TO service_role;

NOTIFY pgrst, 'reload schema';
