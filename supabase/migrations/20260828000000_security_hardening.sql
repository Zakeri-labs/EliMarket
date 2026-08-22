-- Security hardening: close RLS gaps that allowed client-side privilege
-- escalation and payment/price forgery via direct Supabase REST calls
-- (bypassing the Next.js server actions that enforce these rules today).

-- 1) Self-registration can no longer grant admin/rider via user_metadata.
--    Previously: COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
--    let anyone signing up pass options.data.role = 'admin' and get it.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, full_name, role)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2) profiles_update_own had no WITH CHECK, so any user could
--    UPDATE their own row and set role = 'admin' directly.
--    A trigger is used (not WITH CHECK) because it needs to compare
--    NEW.role against OLD.role, which WITH CHECK alone cannot see.
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND auth.role() <> 'service_role'
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only an admin can change a profile role';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS profiles_prevent_role_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_escalation();

-- 3) payments_update_own had no WITH CHECK, so an order owner could
--    UPDATE their own payment row straight to status = 'paid' without
--    ever completing a real payment. Only allow customers to move a
--    payment to a non-value-granting state (cancel); anything that
--    grants value ('paid', 'refunded', back to 'pending') requires
--    admin or the service-role key (used server-side only, after the
--    app has actually verified the payment with the provider).
CREATE OR REPLACE FUNCTION public.restrict_payment_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND auth.role() <> 'service_role'
     AND NOT public.is_admin()
     AND NEW.status NOT IN ('cancelled', 'failed') THEN
    RAISE EXCEPTION 'Only a verified server-side flow can set payment status to %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS payments_restrict_status_transition ON public.payments;
CREATE TRIGGER payments_restrict_status_transition
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.restrict_payment_status_transition();

-- 4) order_items_insert only checked that the order belonged to the
--    caller, not that unit_price matched the real (possibly
--    campaign-discounted) product price — so a direct REST call could
--    insert arbitrarily cheap line items. This mirrors
--    src/lib/campaigns/apply.ts's campaignCandidatePrice() in SQL so
--    legitimate discounted checkouts still pass.
CREATE OR REPLACE FUNCTION public.effective_product_price(
  p_product_id UUID,
  p_at TIMESTAMPTZ DEFAULT NOW()
) RETURNS NUMERIC
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  list_price NUMERIC;
  best NUMERIC;
  candidate NUMERIC;
  camp RECORD;
BEGIN
  SELECT price INTO list_price FROM public.products WHERE id = p_product_id;
  IF list_price IS NULL THEN
    RETURN NULL;
  END IF;

  best := list_price;

  FOR camp IN
    SELECT c.type, c.discount_value, cp.sale_price
    FROM public.campaigns c
    JOIN public.campaign_products cp ON cp.campaign_id = c.id
    WHERE cp.product_id = p_product_id
      AND c.is_active
      AND c.starts_at <= p_at
      AND c.ends_at > p_at
  LOOP
    IF camp.sale_price IS NOT NULL THEN
      candidate := ROUND(camp.sale_price, 3);
    ELSIF camp.type = 'percent' THEN
      candidate := ROUND(list_price * (1 - camp.discount_value / 100), 3);
    ELSE
      candidate := ROUND(list_price - camp.discount_value, 3);
    END IF;
    IF candidate < 0 THEN
      candidate := 0;
    END IF;
    IF candidate < best THEN
      best := candidate;
    END IF;
  END LOOP;

  RETURN best;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_order_item_price()
RETURNS TRIGGER AS $$
DECLARE
  expected NUMERIC;
BEGIN
  IF auth.role() = 'service_role' OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  expected := public.effective_product_price(NEW.product_id);
  IF expected IS NULL OR NEW.unit_price <> expected THEN
    RAISE EXCEPTION 'unit_price does not match the current product price';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS order_items_validate_price ON public.order_items;
CREATE TRIGGER order_items_validate_price
  BEFORE INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.validate_order_item_price();

-- 5) orders.total was trusted as whatever the client sent at creation
--    time and never reconciled against the items actually billed.
--    Recompute it from order_items after every change, mirroring
--    cartTotals() in src/config/brand.ts (keep these in sync manually
--    if delivery fee / VAT / free-delivery threshold ever change).
CREATE OR REPLACE FUNCTION public.recompute_order_total()
RETURNS TRIGGER AS $$
DECLARE
  v_order_id UUID;
  v_subtotal NUMERIC;
  v_delivery NUMERIC;
  v_vat NUMERIC;
BEGIN
  v_order_id := COALESCE(NEW.order_id, OLD.order_id);

  SELECT COALESCE(SUM(unit_price * quantity), 0) INTO v_subtotal
  FROM public.order_items
  WHERE order_id = v_order_id;

  v_delivery := CASE WHEN v_subtotal >= 10 THEN 0 ELSE 0.5 END;
  v_vat := ROUND(v_subtotal * 0.05, 3);

  UPDATE public.orders
  SET total = ROUND(v_subtotal + v_delivery + v_vat, 3)
  WHERE id = v_order_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS order_items_recompute_total ON public.order_items;
CREATE TRIGGER order_items_recompute_total
  AFTER INSERT OR UPDATE OR DELETE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.recompute_order_total();

-- 6) Pin search_path on the remaining SECURITY DEFINER functions that
--    predate this migration (defense-in-depth against search_path
--    hijacking; address_in_coverage() already had this).
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.upsert_store_coverage(UUID, TEXT, TEXT) SET search_path = public;
ALTER FUNCTION public.get_store_coverage_geojson(UUID) SET search_path = public;
