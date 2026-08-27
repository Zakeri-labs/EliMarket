-- Real, per-language copy for the three existing homepage hero banners.
-- Rows are addressed by id; missing rows are a no-op. Admins can still edit
-- everything afterwards from the banners panel.

-- 1) Today's deal (sort_order 0)
UPDATE public.hero_banners SET
  badge         = 'پیشنهاد ویژه امروز',
  title         = 'هر چی بخوای، همین امروز دمِ در',
  subtitle      = 'روی صدها کالای پرمصرف تخفیف بگیر و سریع تحویل بگیر',
  cta_label     = 'مشاهده پیشنهادها',
  cta_href      = '/search?sale=1',
  badge_fa      = 'پیشنهاد ویژه امروز',
  title_fa      = 'هر چی بخوای، همین امروز دمِ در',
  subtitle_fa   = 'روی صدها کالای پرمصرف تخفیف بگیر و سریع تحویل بگیر',
  cta_label_fa  = 'مشاهده پیشنهادها',
  badge_ar      = 'عرض اليوم',
  title_ar      = 'كل ما تحتاجه يصلك اليوم',
  subtitle_ar   = 'خصومات على مئات المنتجات الأساسية مع توصيل سريع',
  cta_label_ar  = 'تصفّح العروض',
  badge_en      = 'Today''s deal',
  title_en      = 'Whatever you need, at your door today',
  subtitle_en   = 'Save on hundreds of everyday items with fast delivery',
  cta_label_en  = 'Shop deals'
WHERE id = 'f085f58e-6413-4ef6-aa6f-b3ec48655d22';

-- 2) 15% off first order (sort_order 1)
UPDATE public.hero_banners SET
  badge         = '۱۵٪ تخفیف',
  title         = '۱۵٪ تخفیف روی اولین سفارش',
  subtitle      = 'کد تخفیف هنگام پرداخت به‌صورت خودکار اعمال می‌شود',
  cta_label     = 'شروع خرید',
  cta_href      = '/categories',
  badge_fa      = '۱۵٪ تخفیف',
  title_fa      = '۱۵٪ تخفیف روی اولین سفارش',
  subtitle_fa   = 'کد تخفیف هنگام پرداخت به‌صورت خودکار اعمال می‌شود',
  cta_label_fa  = 'شروع خرید',
  badge_ar      = 'خصم ١٥٪',
  title_ar      = 'خصم ١٥٪ على طلبك الأول',
  subtitle_ar   = 'يُطبّق كود الخصم تلقائياً عند الدفع',
  cta_label_ar  = 'ابدأ التسوق',
  badge_en      = '15% off',
  title_en      = '15% off your first order',
  subtitle_en   = 'The code is applied automatically at checkout',
  cta_label_en  = 'Start shopping'
WHERE id = '6c285754-6fde-48f1-b318-805d009b2037';

-- 3) Breakfast picks (sort_order 2)
UPDATE public.hero_banners SET
  badge         = 'ویژه صبحانه',
  title         = 'صبحانه‌ات را کامل کن',
  subtitle      = 'نان تازه، لبنیات، عسل و تخم‌مرغ با تحویل سریع صبحگاهی',
  cta_label     = 'خرید اقلام صبحانه',
  cta_href      = '/categories/bakery',
  badge_fa      = 'ویژه صبحانه',
  title_fa      = 'صبحانه‌ات را کامل کن',
  subtitle_fa   = 'نان تازه، لبنیات، عسل و تخم‌مرغ با تحویل سریع صبحگاهی',
  cta_label_fa  = 'خرید اقلام صبحانه',
  badge_ar      = 'ركن الفطور',
  title_ar      = 'فطورك أصبح مكتملاً',
  subtitle_ar   = 'خبز طازج وألبان وعسل وبيض مع توصيل صباحي سريع',
  cta_label_ar  = 'تسوّق الفطور',
  badge_en      = 'Breakfast picks',
  title_en      = 'Complete your breakfast table',
  subtitle_en   = 'Fresh bread, dairy, honey and eggs with fast morning delivery',
  cta_label_en  = 'Shop breakfast'
WHERE id = '250a0614-e5eb-4049-a0ab-11b663339aae';
