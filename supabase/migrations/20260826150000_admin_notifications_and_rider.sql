-- Persistent admin notifications + rider address access

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

CREATE INDEX IF NOT EXISTS admin_notifications_recipient_unread_idx
  ON public.admin_notifications (recipient_id)
  WHERE read_at IS NULL;

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

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

-- Service / trigger inserts for all admins
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
  WHERE p.role = 'admin';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_notify_admins ON public.orders;
CREATE TRIGGER orders_notify_admins
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_new_order();

-- Riders can read addresses of orders assigned to them (or ready pool via order join in app;
-- for ready orders they need address before accept — allow select when order is preparing & unassigned
-- or assigned to this rider)
DROP POLICY IF EXISTS addresses_select_for_rider ON public.addresses;
CREATE POLICY addresses_select_for_rider ON public.addresses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.address_id = addresses.id
        AND (
          o.rider_id = auth.uid()
          OR (o.status = 'preparing' AND o.rider_id IS NULL AND EXISTS (
            SELECT 1 FROM public.profiles pr WHERE pr.id = auth.uid() AND pr.role = 'rider'
          ))
        )
    )
  );

-- Realtime publication (ignore if already added)
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
