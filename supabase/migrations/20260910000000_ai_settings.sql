-- Admin-managed AI settings (image generation, models, prompt style).
-- Replaces the AI_* / OPENAI_* tuning environment variables. API keys stay in
-- the server environment. Admin-only: never exposed to anon/authenticated
-- readers; server code reads it through the service-role client.
CREATE TABLE IF NOT EXISTS public.ai_settings (
  id         TEXT PRIMARY KEY DEFAULT 'default',
  config     JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_settings_admin_all ON public.ai_settings;
CREATE POLICY ai_settings_admin_all ON public.ai_settings FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

GRANT ALL ON TABLE public.ai_settings TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.ai_settings TO authenticated;

INSERT INTO public.ai_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;
