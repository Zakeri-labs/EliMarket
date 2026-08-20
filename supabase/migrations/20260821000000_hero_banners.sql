-- Multiple homepage hero banners (admin-managed carousel)

CREATE TABLE IF NOT EXISTS public.hero_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge TEXT,
  title TEXT,
  subtitle TEXT,
  cta_label TEXT,
  cta_href TEXT NOT NULL DEFAULT '/categories',
  image_url TEXT,
  blur_hash TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS hero_banners_sort_idx
  ON public.hero_banners (sort_order, created_at);

ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS hero_banners_select_all ON public.hero_banners;
CREATE POLICY hero_banners_select_all ON public.hero_banners
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS hero_banners_admin_all ON public.hero_banners;
CREATE POLICY hero_banners_admin_all ON public.hero_banners
  FOR ALL USING (public.is_admin());

GRANT SELECT ON TABLE public.hero_banners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.hero_banners TO authenticated;
GRANT ALL ON TABLE public.hero_banners TO service_role;

INSERT INTO public.hero_banners (
  badge,
  title,
  subtitle,
  cta_label,
  cta_href,
  image_url,
  blur_hash,
  sort_order,
  is_active
)
SELECT
  s.hero_badge,
  s.hero_title,
  s.hero_subtitle,
  s.hero_cta_label,
  COALESCE(NULLIF(s.hero_cta_href, ''), '/categories'),
  s.hero_image_url,
  s.hero_blur_hash,
  0,
  TRUE
FROM public.store_settings s
WHERE s.id = 'default'
  AND NOT EXISTS (SELECT 1 FROM public.hero_banners)
  AND (
    COALESCE(s.hero_title, '') <> ''
    OR COALESCE(s.hero_image_url, '') <> ''
    OR COALESCE(s.hero_badge, '') <> ''
    OR COALESCE(s.hero_subtitle, '') <> ''
  );
