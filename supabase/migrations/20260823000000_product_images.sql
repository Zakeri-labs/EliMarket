-- Gallery images per product. products.image_url stays as the catalog cover.

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  blur_hash TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_images_product_id_idx
  ON public.product_images (product_id);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_images_select_all ON public.product_images;
CREATE POLICY product_images_select_all ON public.product_images
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS product_images_admin_all ON public.product_images;
CREATE POLICY product_images_admin_all ON public.product_images
  FOR ALL USING (public.is_admin());

INSERT INTO public.product_images (product_id, image_url, blur_hash, sort_order, is_primary)
SELECT id, image_url, blur_hash, 0, TRUE
FROM public.products
WHERE image_url IS NOT NULL
  AND btrim(image_url) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.product_images pi WHERE pi.product_id = products.id
  );
