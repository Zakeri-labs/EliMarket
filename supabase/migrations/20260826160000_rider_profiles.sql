-- Rider identity details (Oman: Civil Number ≈ national ID)
CREATE TABLE IF NOT EXISTS public.rider_profiles (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  civil_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT rider_profiles_civil_id_key UNIQUE (civil_id)
);

CREATE INDEX IF NOT EXISTS rider_profiles_phone_idx ON public.rider_profiles (phone);

ALTER TABLE public.rider_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY rider_profiles_admin_all ON public.rider_profiles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY rider_profiles_select_own ON public.rider_profiles
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY rider_profiles_select_for_order_context ON public.rider_profiles
  FOR SELECT USING (
    public.is_admin()
    OR auth.uid() = profile_id
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.rider_id = rider_profiles.profile_id
        AND (o.user_id = auth.uid() OR o.rider_id = auth.uid())
    )
  );
