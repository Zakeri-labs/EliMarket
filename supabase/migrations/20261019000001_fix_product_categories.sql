-- Move products that were filed under the wrong category.
UPDATE public.products SET category_id = (SELECT id FROM public.categories WHERE slug = 'snacks')
  WHERE name_en = 'Pak Chocolate Cream';
UPDATE public.products SET category_id = (SELECT id FROM public.categories WHERE slug = 'household')
  WHERE name_en = 'Dreamies Cat Treats';
UPDATE public.products SET category_id = (SELECT id FROM public.categories WHERE slug = 'dairy')
  WHERE name_en IN ('Mirax Milky Ice Cream', 'Ice Cream Gaz');
UPDATE public.products SET category_id = (SELECT id FROM public.categories WHERE slug = 'pantry')
  WHERE name_en IN ('Chocolate Hazelnut Spread', 'Farmand Double Chocolate Hazelnut Spread', 'Raw Iranian Almonds');
