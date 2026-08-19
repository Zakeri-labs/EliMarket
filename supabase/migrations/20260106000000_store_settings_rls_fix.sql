-- Split store_settings write policy (FOR ALL + upsert caused deadlocks under concurrent access)
DROP POLICY IF EXISTS store_settings_admin_write ON public.store_settings;
DROP POLICY IF EXISTS store_settings_admin_insert ON public.store_settings;
DROP POLICY IF EXISTS store_settings_admin_update ON public.store_settings;
DROP POLICY IF EXISTS store_settings_admin_delete ON public.store_settings;

CREATE POLICY store_settings_admin_insert ON public.store_settings
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY store_settings_admin_update ON public.store_settings
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY store_settings_admin_delete ON public.store_settings
  FOR DELETE
  USING (public.is_admin());
