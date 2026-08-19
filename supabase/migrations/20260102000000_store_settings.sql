-- Global storefront settings (singleton row)
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  show_prices BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.store_settings (id, show_prices)
VALUES ('default', TRUE)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY store_settings_select_all ON public.store_settings
  FOR SELECT USING (TRUE);

CREATE POLICY store_settings_admin_write ON public.store_settings
  FOR ALL USING (public.is_admin());
