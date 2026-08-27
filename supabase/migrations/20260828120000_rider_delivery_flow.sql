-- Rider delivery workflow: pickup confirmation + delivery / failed-delivery proof.
--
-- The rider panel now has three per-order steps:
--   1. picked up from store  -> stamps picked_up_at
--   2. delivered to customer -> status 'delivered' + a mandatory proof photo
--   3. not delivered          -> records a reason (+ note for "other") and a
--                                mandatory photo, then returns the order to the
--                                ready pool (status 'preparing', rider cleared)
--                                exactly as before.

-- 1) New columns on orders (all nullable, no default; existing select("*")
--    queries pick them up automatically).
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS picked_up_at              TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_photo_path      TEXT,
  ADD COLUMN IF NOT EXISTS failed_delivery_reason    TEXT,
  ADD COLUMN IF NOT EXISTS failed_delivery_note      TEXT,
  ADD COLUMN IF NOT EXISTS failed_delivery_photo_path TEXT,
  ADD COLUMN IF NOT EXISTS failed_delivery_at        TIMESTAMPTZ;

DO $$
BEGIN
  ALTER TABLE public.orders
    ADD CONSTRAINT orders_failed_delivery_reason_check
    CHECK (failed_delivery_reason IN
      ('customer_absent', 'no_answer', 'wrong_address', 'customer_refused', 'other'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2) Private bucket for delivery / failed-delivery proof photos.
--    Kept private: admin and the order owner view photos only through
--    short-lived signed URLs minted server-side (getDeliveryProofUrlAction).
INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-proofs', 'delivery-proofs', FALSE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS delivery_proofs_rider_insert ON storage.objects;
CREATE POLICY delivery_proofs_rider_insert ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'delivery-proofs' AND public.is_rider());

DROP POLICY IF EXISTS delivery_proofs_staff_read ON storage.objects;
CREATE POLICY delivery_proofs_staff_read ON storage.objects
  FOR SELECT
  USING (bucket_id = 'delivery-proofs' AND (public.is_admin() OR public.is_rider()));
