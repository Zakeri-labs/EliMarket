-- Rider order visibility + update rules for accept / deliver / return

CREATE OR REPLACE FUNCTION public.is_rider()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'rider'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_rider() TO authenticated;

DROP POLICY IF EXISTS orders_select_own ON public.orders;
CREATE POLICY orders_select_own ON public.orders
  FOR SELECT USING (
    auth.uid() = user_id
    OR public.is_admin()
    OR auth.uid() = rider_id
    OR (
      public.is_rider()
      AND status = 'preparing'
      AND rider_id IS NULL
    )
  );

DROP POLICY IF EXISTS orders_admin_update ON public.orders;
DROP POLICY IF EXISTS orders_update_admin ON public.orders;
DROP POLICY IF EXISTS orders_update_rider ON public.orders;

CREATE POLICY orders_update_admin ON public.orders
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Accept ready orders, deliver assigned ones, or return undelivered to pool
CREATE POLICY orders_update_rider ON public.orders
  FOR UPDATE
  USING (
    public.is_rider()
    AND (
      auth.uid() = rider_id
      OR (status = 'preparing' AND rider_id IS NULL)
    )
  )
  WITH CHECK (
    public.is_rider()
    AND (
      (auth.uid() = rider_id AND status IN ('out_for_delivery', 'delivered'))
      OR (rider_id IS NULL AND status = 'preparing')
    )
  );

DROP POLICY IF EXISTS order_items_select ON public.order_items;
CREATE POLICY order_items_select ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (
          o.user_id = auth.uid()
          OR public.is_admin()
          OR o.rider_id = auth.uid()
          OR (
            public.is_rider()
            AND o.status = 'preparing'
            AND o.rider_id IS NULL
          )
        )
    )
  );
