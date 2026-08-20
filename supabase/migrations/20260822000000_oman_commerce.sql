-- Nested categories, OMR money precision, payments, coverage check

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON public.categories(parent_id);

ALTER TABLE public.products
  ALTER COLUMN price TYPE NUMERIC(12, 3),
  ALTER COLUMN compare_at_price TYPE NUMERIC(12, 3),
  ALTER COLUMN currency SET DEFAULT 'OMR';

ALTER TABLE public.orders
  ALTER COLUMN total TYPE NUMERIC(12, 3),
  ALTER COLUMN currency SET DEFAULT 'OMR';

ALTER TABLE public.order_items
  ALTER COLUMN unit_price TYPE NUMERIC(12, 3);

UPDATE public.order_items
SET unit_price = ROUND((unit_price / 100000)::numeric, 3)
WHERE unit_price >= 10
  AND EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id AND o.currency = 'IRR'
  );

UPDATE public.orders
SET
  total = ROUND((total / 100000)::numeric, 3),
  currency = 'OMR'
WHERE currency = 'IRR' AND total >= 10;

UPDATE public.products
SET
  price = ROUND((price / 100000)::numeric, 3),
  compare_at_price = CASE
    WHEN compare_at_price IS NULL THEN NULL
    WHEN compare_at_price >= 10 THEN ROUND((compare_at_price / 100000)::numeric, 3)
    ELSE compare_at_price
  END,
  currency = 'OMR'
WHERE currency = 'IRR' AND price >= 10;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid';

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed', 'refunded'));

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'sandbox',
  provider_session_id TEXT,
  amount NUMERIC(12, 3) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'OMR',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS payments_order_id_idx ON public.payments(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_session_id_idx
  ON public.payments(provider_session_id)
  WHERE provider_session_id IS NOT NULL;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payments_select_own ON public.payments;
CREATE POLICY payments_select_own ON public.payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = payments.order_id
      AND (o.user_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS payments_insert_own ON public.payments;
CREATE POLICY payments_insert_own ON public.payments FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = payments.order_id AND o.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS payments_update_own ON public.payments;
CREATE POLICY payments_update_own ON public.payments FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = payments.order_id
      AND (o.user_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS payments_admin_all ON public.payments;
CREATE POLICY payments_admin_all ON public.payments FOR ALL USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.address_in_coverage(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION
) RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM public.stores WHERE coverage_area IS NOT NULL
    ) THEN TRUE
    ELSE EXISTS (
      SELECT 1 FROM public.stores
      WHERE coverage_area IS NOT NULL
        AND ST_Contains(
          coverage_area,
          ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)
        )
    )
  END;
$$;

GRANT EXECUTE ON FUNCTION public.address_in_coverage(DOUBLE PRECISION, DOUBLE PRECISION)
  TO authenticated, anon, service_role;
