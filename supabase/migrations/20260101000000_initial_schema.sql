-- Enable PostGIS for store coverage polygons
CREATE EXTENSION IF NOT EXISTS postgis;

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'rider')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'IRR',
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  coverage_area geometry(Polygon, 4326),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  address_line TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')
  ),
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'IRR',
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'online')),
  delivery_slot TEXT,
  address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  rider_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0)
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, full_name, role)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- profiles
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- categories (public read, admin write)
CREATE POLICY categories_select_all ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY categories_admin_all ON public.categories FOR ALL USING (public.is_admin());

-- products (public read active, admin full)
CREATE POLICY products_select_active ON public.products FOR SELECT USING (is_active = TRUE OR public.is_admin());
CREATE POLICY products_admin_all ON public.products FOR ALL USING (public.is_admin());

-- stores (admin only)
CREATE POLICY stores_admin_all ON public.stores FOR ALL USING (public.is_admin());

-- addresses (own only)
CREATE POLICY addresses_select_own ON public.addresses FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY addresses_insert_own ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY addresses_update_own ON public.addresses FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY addresses_delete_own ON public.addresses FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- orders
CREATE POLICY orders_select_own ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin() OR auth.uid() = rider_id);
CREATE POLICY orders_insert_own ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY orders_admin_update ON public.orders FOR UPDATE USING (public.is_admin() OR auth.uid() = rider_id);

-- order_items
CREATE POLICY order_items_select ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND (o.user_id = auth.uid() OR public.is_admin() OR o.rider_id = auth.uid())
  )
);
CREATE POLICY order_items_insert ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
  )
);

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY product_images_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY product_images_admin_write ON storage.objects
  FOR ALL USING (bucket_id = 'product-images' AND public.is_admin());

-- Realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Helper to upsert store coverage from GeoJSON
CREATE OR REPLACE FUNCTION public.upsert_store_coverage(
  p_store_id UUID,
  p_name TEXT,
  p_geojson TEXT
) RETURNS public.stores AS $$
DECLARE
  result public.stores;
BEGIN
  IF p_store_id IS NULL THEN
    INSERT INTO public.stores (name, coverage_area)
    VALUES (p_name, ST_SetSRID(ST_GeomFromGeoJSON(p_geojson), 4326))
    RETURNING * INTO result;
  ELSE
    UPDATE public.stores
    SET
      name = p_name,
      coverage_area = ST_SetSRID(ST_GeomFromGeoJSON(p_geojson), 4326)
    WHERE id = p_store_id
    RETURNING * INTO result;
  END IF;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_store_coverage_geojson(p_store_id UUID)
RETURNS JSONB AS $$
  SELECT ST_AsGeoJSON(coverage_area)::jsonb
  FROM public.stores
  WHERE id = p_store_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('لبنیات', 'dairy', 1),
  ('میوه و سبزی', 'produce', 2),
  ('نوشیدنی', 'beverages', 3)
ON CONFLICT (slug) DO NOTHING;
