-- Tri-lingual category names + sample supermarket categories with images
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS name_fa TEXT,
  ADD COLUMN IF NOT EXISTS name_ar TEXT,
  ADD COLUMN IF NOT EXISTS name_en TEXT;

UPDATE public.categories
SET
  name_fa = COALESCE(name_fa, name),
  name_ar = COALESCE(name_ar, name),
  name_en = COALESCE(name_en, name)
WHERE name_fa IS NULL OR name_ar IS NULL OR name_en IS NULL;

INSERT INTO public.categories (
  name,
  name_fa,
  name_ar,
  name_en,
  slug,
  sort_order,
  image_url
) VALUES
  (
    'میوه و سبزیجات',
    'میوه و سبزیجات',
    'فواكه وخضروات',
    'Fruits & Vegetables',
    'produce',
    1,
    'https://images.unsplash.com/photo-1619566636852-ba0ecd850a70?w=400&q=80'
  ),
  (
    'لبنیات و تخم‌مرغ',
    'لبنیات و تخم‌مرغ',
    'منتجات الألبان والبيض',
    'Dairy & Eggs',
    'dairy',
    2,
    'https://images.unsplash.com/photo-1563636619095-d2949ffd3997?w=400&q=80'
  ),
  (
    'گوشت و مرغ',
    'گوشت و مرغ',
    'اللحوم والدواجن',
    'Meat & Poultry',
    'meat',
    3,
    'https://images.unsplash.com/photo-1603048588665-791ca9ecb617?w=400&q=80'
  ),
  (
    'نان و شیرینی',
    'نان و شیرینی',
    'المخبوزات',
    'Bakery',
    'bakery',
    4,
    'https://images.unsplash.com/photo-1509440161594-b23512a607ef?w=400&q=80'
  ),
  (
    'نوشیدنی‌ها',
    'نوشیدنی‌ها',
    'المشروبات',
    'Beverages',
    'beverages',
    5,
    'https://images.unsplash.com/photo-1544145945-f904073aaa7b?w=400&q=80'
  ),
  (
    'تنقلات و شکلات',
    'تنقلات و شکلات',
    'الوجبات الخفيفة والشوكولاتة',
    'Snacks & Chocolates',
    'snacks',
    6,
    'https://images.unsplash.com/photo-1599592819558-5c6a4c4d4d2e?w=400&q=80'
  ),
  (
    'خواربار و اقلام پایه',
    'خواربار و اقلام پایه',
    'المخزن والأساسيات',
    'Pantry & Staples',
    'pantry',
    7,
    'https://images.unsplash.com/photo-1596040033229-a9821ebd114d?w=400&q=80'
  ),
  (
    'مراقبت شخصی',
    'مراقبت شخصی',
    'العناية الشخصية',
    'Personal Care',
    'personal-care',
    8,
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80'
  ),
  (
    'لوازم خانگی',
    'لوازم خانگی',
    'مستلزمات المنزل',
    'Household',
    'household',
    9,
    'https://images.unsplash.com/photo-1585421514765-c3b2f2d7ec98?w=400&q=80'
  ),
  (
    'مراقبت از نوزاد',
    'مراقبت از نوزاد',
    'رعاية الأطفال',
    'Baby Care',
    'baby-care',
    10,
    'https://images.unsplash.com/photo-1515488042361-ee00e0170ffa?w=400&q=80'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_fa = EXCLUDED.name_fa,
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  sort_order = EXCLUDED.sort_order,
  image_url = EXCLUDED.image_url;
