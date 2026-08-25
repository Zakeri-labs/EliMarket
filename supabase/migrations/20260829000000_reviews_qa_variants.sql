-- Product SKU, size-variant linking, customer reviews, and product Q&A

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS parent_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS variant_label TEXT;

CREATE INDEX IF NOT EXISTS products_parent_product_id_idx ON public.products (parent_product_id);

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.product_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asker_name TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_reviews_product_id_idx ON public.product_reviews (product_id);
CREATE INDEX IF NOT EXISTS product_questions_product_id_idx ON public.product_questions (product_id);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_reviews_select_all ON public.product_reviews;
CREATE POLICY product_reviews_select_all ON public.product_reviews FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS product_reviews_insert_own ON public.product_reviews;
CREATE POLICY product_reviews_insert_own ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS product_reviews_admin_all ON public.product_reviews;
CREATE POLICY product_reviews_admin_all ON public.product_reviews FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS product_questions_select_all ON public.product_questions;
CREATE POLICY product_questions_select_all ON public.product_questions FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS product_questions_insert_own ON public.product_questions;
CREATE POLICY product_questions_insert_own ON public.product_questions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS product_questions_admin_all ON public.product_questions;
CREATE POLICY product_questions_admin_all ON public.product_questions FOR ALL USING (public.is_admin());

GRANT SELECT ON TABLE public.product_reviews TO anon, authenticated;
GRANT INSERT ON TABLE public.product_reviews TO authenticated;
GRANT ALL ON TABLE public.product_reviews TO service_role;

GRANT SELECT ON TABLE public.product_questions TO anon, authenticated;
GRANT INSERT ON TABLE public.product_questions TO authenticated;
GRANT ALL ON TABLE public.product_questions TO service_role;

NOTIFY pgrst, 'reload schema';
