-- Warehouse inventory: unit types, low-stock threshold, atomic stock adjust, cancel restore.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS inventory_unit TEXT NOT NULL DEFAULT 'count';

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_inventory_unit_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_inventory_unit_check
  CHECK (inventory_unit IN ('count', 'weight', 'pack'));

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS low_stock_threshold INT NOT NULL DEFAULT 5;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_low_stock_threshold_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_low_stock_threshold_check
  CHECK (low_stock_threshold >= 0);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stock_restored BOOLEAN NOT NULL DEFAULT FALSE;

CREATE OR REPLACE FUNCTION public.decrement_product_stock(p_product_id UUID, p_qty INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_stock INT;
BEGIN
  IF p_qty <= 0 THEN
    RAISE EXCEPTION 'invalid_qty';
  END IF;

  UPDATE public.products
  SET stock = stock - p_qty
  WHERE id = p_product_id
    AND stock >= p_qty
  RETURNING stock INTO new_stock;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_stock';
  END IF;

  RETURN new_stock;
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_order_stock(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ord RECORD;
  item RECORD;
BEGIN
  SELECT * INTO ord FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'order_not_found';
  END IF;
  IF ord.stock_restored THEN
    RETURN;
  END IF;
  IF ord.user_id IS DISTINCT FROM auth.uid() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  FOR item IN
    SELECT product_id, quantity FROM public.order_items WHERE order_id = p_order_id
  LOOP
    UPDATE public.products
    SET stock = stock + item.quantity
    WHERE id = item.product_id;
  END LOOP;

  UPDATE public.orders
  SET stock_restored = TRUE
  WHERE id = p_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_order_stock_decrement(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ord RECORD;
  item RECORD;
BEGIN
  SELECT * INTO ord FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'order_not_found';
  END IF;
  IF ord.user_id IS DISTINCT FROM auth.uid() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  FOR item IN
    SELECT product_id, quantity FROM public.order_items WHERE order_id = p_order_id
  LOOP
    UPDATE public.products
    SET stock = stock - item.quantity
    WHERE id = item.product_id
      AND stock >= item.quantity;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'insufficient_stock';
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_order_stock_decrement(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_order_stock_decrement(UUID) TO authenticated;

DROP FUNCTION IF EXISTS public.adjust_product_stock(UUID, INT);

DROP POLICY IF EXISTS orders_delete_own_pending ON public.orders;
CREATE POLICY orders_delete_own_pending ON public.orders
  FOR DELETE USING (
    auth.uid() = user_id
    AND status = 'pending'
    AND COALESCE(payment_status, 'unpaid') IN ('unpaid', 'pending')
  );

UPDATE public.products
SET inventory_unit = 'weight'
WHERE inventory_unit = 'count'
  AND (name ILIKE '%کیلو%' OR name ILIKE '%kg%' OR name ILIKE '%كيلو%');
