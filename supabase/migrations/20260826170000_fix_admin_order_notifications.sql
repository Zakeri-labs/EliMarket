-- Fix admin new-order notifications: grants, replica identity, realtime, safer trigger

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'new_order',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_notifications_recipient_created_idx
  ON public.admin_notifications (recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS admin_notifications_order_id_idx
  ON public.admin_notifications (order_id)
  WHERE order_id IS NOT NULL;

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications REPLICA IDENTITY FULL;

-- Realtime + authenticated clients need explicit grants
GRANT SELECT, UPDATE, DELETE ON public.admin_notifications TO authenticated;
GRANT ALL ON public.admin_notifications TO service_role;

DROP POLICY IF EXISTS admin_notifications_select_own ON public.admin_notifications;
CREATE POLICY admin_notifications_select_own ON public.admin_notifications
  FOR SELECT USING (auth.uid() = recipient_id AND public.is_admin());

DROP POLICY IF EXISTS admin_notifications_update_own ON public.admin_notifications;
CREATE POLICY admin_notifications_update_own ON public.admin_notifications
  FOR UPDATE USING (auth.uid() = recipient_id AND public.is_admin())
  WITH CHECK (auth.uid() = recipient_id AND public.is_admin());

DROP POLICY IF EXISTS admin_notifications_delete_own ON public.admin_notifications;
CREATE POLICY admin_notifications_delete_own ON public.admin_notifications
  FOR DELETE USING (auth.uid() = recipient_id AND public.is_admin());

-- Trigger inserts as definer (bypasses RLS). De-dupe per admin+order.
CREATE OR REPLACE FUNCTION public.notify_admins_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  short_id TEXT;
BEGIN
  short_id := upper(left(replace(NEW.id::text, '-', ''), 8));
  INSERT INTO public.admin_notifications (recipient_id, type, title, body, order_id)
  SELECT
    p.id,
    'new_order',
    'New order #' || short_id,
    'A new order was placed. Total: ' || NEW.total::text || ' ' || COALESCE(NEW.currency, 'OMR'),
    NEW.id
  FROM public.profiles p
  WHERE p.role = 'admin'
    AND NOT EXISTS (
      SELECT 1
      FROM public.admin_notifications n
      WHERE n.recipient_id = p.id
        AND n.order_id = NEW.id
        AND n.type = 'new_order'
    );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_notify_admins ON public.orders;
CREATE TRIGGER orders_notify_admins
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_new_order();

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;
