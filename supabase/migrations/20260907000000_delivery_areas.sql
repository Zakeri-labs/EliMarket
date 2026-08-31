-- Admin-managed storefront delivery areas (replaces the hard-coded "Deliver to" list).
-- Each area is a named pin + radius (circle) the admin places on a map. This is separate
-- from stores.coverage_area, which stays the single checkout-gating boundary.

CREATE TABLE IF NOT EXISTS public.delivery_areas (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL UNIQUE,
  name_fa      TEXT NOT NULL,
  name_ar      TEXT,
  name_en      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add every non-identity column defensively so the migration is safe to re-run and also
-- upgrades a table created by an earlier version of this file.
ALTER TABLE public.delivery_areas
  ADD COLUMN IF NOT EXISTS name_fa      TEXT,
  ADD COLUMN IF NOT EXISTS name_ar      TEXT,
  ADD COLUMN IF NOT EXISTS name_en      TEXT,
  ADD COLUMN IF NOT EXISTS serviceable  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS active       BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS sort_order   INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS center_lat   DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS center_lng   DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS radius_km    NUMERIC(6, 2) NOT NULL DEFAULT 2.5,
  ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(12, 3),
  ADD COLUMN IF NOT EXISTS min_order    NUMERIC(12, 3),
  ADD COLUMN IF NOT EXISTS eta_minutes  INT;

ALTER TABLE public.delivery_areas ALTER COLUMN name_fa SET NOT NULL;

DO $$
BEGIN
  ALTER TABLE public.delivery_areas ADD CONSTRAINT delivery_areas_radius_km_check CHECK (radius_km > 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.delivery_areas
    ADD CONSTRAINT delivery_areas_delivery_fee_check CHECK (delivery_fee IS NULL OR delivery_fee >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.delivery_areas
    ADD CONSTRAINT delivery_areas_min_order_check CHECK (min_order IS NULL OR min_order >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.delivery_areas
    ADD CONSTRAINT delivery_areas_eta_minutes_check CHECK (eta_minutes IS NULL OR eta_minutes >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS delivery_areas_sort_order_idx ON public.delivery_areas (sort_order);

ALTER TABLE public.delivery_areas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS delivery_areas_select_all ON public.delivery_areas;
CREATE POLICY delivery_areas_select_all ON public.delivery_areas FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS delivery_areas_admin_all ON public.delivery_areas;
CREATE POLICY delivery_areas_admin_all ON public.delivery_areas FOR ALL USING (public.is_admin());

-- Seed: Muscat districts (Muscat Hills — where the store operates — first) with approximate
-- centers the admin can nudge on the map, then the three other Omani cities as
-- non-serviceable "coming soon" entries.
INSERT INTO public.delivery_areas
  (slug, name_fa, name_ar, name_en, serviceable, sort_order, center_lat, center_lng, radius_km) VALUES
  ('muscat-hills',          'هیلز مسقط',          'هيلز مسقط',            'Muscat Hills',           TRUE,  0,  23.5990, 58.4190, 2.0),
  ('al-khoudh',             'الخوض',              'الخوض',               'Al Khoudh',              TRUE,  1,  23.5830, 58.1690, 3.0),
  ('al-ghubra',             'الغبره',             'الغبرة',              'Al Ghubra',              TRUE,  2,  23.5980, 58.4280, 2.5),
  ('seeb',                  'السیب',              'السيب',               'Seeb',                   TRUE,  3,  23.6700, 58.1890, 3.5),
  ('al-mawaleh',            'المعبیله',           'المعبيلة',            'Al Mawaleh',             FALSE, 4,  23.6320, 58.1980, 2.5),
  ('al-hail',               'الحیل',              'الحيل',               'Al Hail',                FALSE, 5,  23.6400, 58.1900, 2.5),
  ('azaiba',                'العذیبه',            'العذيبة',             'Azaiba',                 FALSE, 6,  23.6070, 58.4100, 2.5),
  ('ghala',                 'غلا',                'غلا',                 'Ghala',                  FALSE, 7,  23.5850, 58.3900, 2.5),
  ('bausher',               'بوشر',               'بوشر',                'Bausher',                FALSE, 8,  23.5770, 58.4000, 3.0),
  ('al-ansab',              'الانصب',             'الأنصب',              'Al Ansab',               FALSE, 9,  23.5600, 58.3600, 2.5),
  ('al-khuwair',            'الخویر',             'الخوير',              'Al Khuwair',             FALSE, 10, 23.6000, 58.4500, 2.0),
  ('madinat-sultan-qaboos', 'مدینه سلطان قابوس',  'مدينة السلطان قابوس', 'Madinat Sultan Qaboos',  FALSE, 11, 23.5930, 58.4620, 2.0),
  ('qurum',                 'القرم',              'القرم',               'Qurum',                  FALSE, 12, 23.6100, 58.4700, 2.5),
  ('ruwi',                  'روی',                'روي',                 'Ruwi',                   FALSE, 13, 23.5900, 58.5450, 2.0),
  ('muttrah',               'مطرح',               'مطرح',                'Muttrah',                FALSE, 14, 23.6180, 58.5670, 2.5),
  ('darsait',               'دارسیت',             'درسيت',               'Darsait',                FALSE, 15, 23.6000, 58.5500, 2.0),
  ('wadi-kabir',            'وادی الکبیر',        'وادي الكبير',         'Wadi Al Kabir',          FALSE, 16, 23.5900, 58.5600, 2.0),
  ('wadi-adai',             'وادی عدی',           'وادي عدي',            'Wadi Adai',              FALSE, 17, 23.5750, 58.5400, 2.5),
  ('al-amerat',             'العامرات',           'العامرات',            'Al Amerat',              FALSE, 18, 23.5100, 58.5000, 4.0),
  ('al-bustan',             'البستان',            'البستان',             'Al Bustan',              FALSE, 19, 23.5750, 58.6000, 2.5),
  ('qantab',                'القنتب',             'القنتب',              'Qantab',                 FALSE, 20, 23.5600, 58.6300, 2.5),
  ('sohar',                 'صحار',               'صحار',                'Sohar',                  FALSE, 30, 24.3470, 56.7090, 10.0),
  ('salalah',               'صلاله',              'صلالة',               'Salalah',                FALSE, 31, 17.0190, 54.0890, 10.0),
  ('nizwa',                 'نزوی',               'نزوى',                'Nizwa',                  FALSE, 32, 22.9330, 57.5330, 10.0)
ON CONFLICT (slug) DO UPDATE SET
  name_fa     = EXCLUDED.name_fa,
  name_ar     = EXCLUDED.name_ar,
  name_en     = EXCLUDED.name_en,
  serviceable = EXCLUDED.serviceable,
  sort_order  = EXCLUDED.sort_order,
  center_lat  = COALESCE(delivery_areas.center_lat, EXCLUDED.center_lat),
  center_lng  = COALESCE(delivery_areas.center_lng, EXCLUDED.center_lng),
  radius_km   = COALESCE(delivery_areas.radius_km, EXCLUDED.radius_km);
