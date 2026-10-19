-- Breakfast hero banner shows a fruit crate: align the copy with the image.
UPDATE public.hero_banners SET
  badge         = 'میوه تازه',
  title         = 'میوه‌های تازه و رسیده',
  subtitle      = 'موز، سیب، انگور و انواع میوه فصل با تحویل سریع',
  cta_label     = 'خرید میوه',
  cta_href      = '/categories/produce',
  badge_fa      = 'میوه تازه',
  title_fa      = 'میوه‌های تازه و رسیده',
  subtitle_fa   = 'موز، سیب، انگور و انواع میوه فصل با تحویل سریع',
  cta_label_fa  = 'خرید میوه',
  badge_ar      = 'فواكه طازجة',
  title_ar      = 'فواكه طازجة وناضجة',
  subtitle_ar   = 'موز وتفاح وعنب وفواكه الموسم مع توصيل سريع',
  cta_label_ar  = 'تسوّق الفواكه',
  badge_en      = 'Fresh fruit',
  title_en      = 'Fresh, ripe fruit every day',
  subtitle_en   = 'Bananas, apples, grapes and seasonal fruit with fast delivery',
  cta_label_en  = 'Shop fruit'
WHERE id = '250a0614-e5eb-4049-a0ab-11b663339aae';
