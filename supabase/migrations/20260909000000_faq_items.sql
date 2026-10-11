-- Admin-managed FAQ shown on the storefront Contact page (replaces the hard-coded list).
-- Each entry is written per language; a missing language falls back to Persian.

CREATE TABLE IF NOT EXISTS public.faq_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_fa TEXT NOT NULL,
  question_ar TEXT,
  question_en TEXT,
  answer_fa   TEXT NOT NULL,
  answer_ar   TEXT,
  answer_en   TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS faq_items_select_active ON public.faq_items;
CREATE POLICY faq_items_select_active ON public.faq_items FOR SELECT USING (is_active OR public.is_admin());

DROP POLICY IF EXISTS faq_items_admin_all ON public.faq_items;
CREATE POLICY faq_items_admin_all ON public.faq_items FOR ALL USING (public.is_admin());

GRANT SELECT ON TABLE public.faq_items TO anon, authenticated;
GRANT ALL ON TABLE public.faq_items TO service_role;

-- Seed with the questions that used to be hard-coded, only on a fresh table.
INSERT INTO public.faq_items (question_fa, question_ar, question_en, answer_fa, answer_ar, answer_en, sort_order)
SELECT * FROM (VALUES
  ('آیا ارسال رایگان دارید؟', 'هل لديكم توصيل مجاني؟', 'Do you offer free delivery?',
   'بله، برای سفارش‌های بالای ۱۰ ریال عمان ارسال رایگان است.', 'نعم، للطلبات فوق ١٠ ريال عماني التوصيل مجاني.', 'Yes, delivery is free for orders over 10 OMR.', 1),
  ('روش‌های پرداخت چیست؟', 'ما هي طرق الدفع؟', 'What payment methods do you accept?',
   'پرداخت آنلاین، کارت‌خوان درب منزل و پرداخت نقدی.', 'الدفع الإلكتروني، نقاط البيع عند التسليم، والدفع النقدي.', 'Online payment, card on delivery, and cash on delivery.', 2),
  ('آیا امکان مرجوع کالا وجود دارد؟', 'هل يمكن إرجاع المنتجات؟', 'Can I return products?',
   'بله، تا ۲۴ ساعت پس از تحویل می‌توانید کالا را مرجوع کنید.', 'نعم، يمكنك إرجاع المنتجات خلال ٢٤ ساعة من التسليم.', 'Yes, you can return products within 24 hours of delivery.', 3),
  ('ساعات کاری فروشگاه چیست؟', 'ما هي ساعات عمل المتجر؟', 'What are your working hours?',
   'شنبه تا پنجشنبه ۸ صبح تا ۱۱ شب، جمعه ۲ بعدازظهر تا ۱۱ شب.', 'السبت – الخميس ٨ صباحًا – ١١ مساءً، الجمعة ٢ ظهرًا – ١١ مساءً.', 'Saturday–Thursday 8 AM–11 PM, Friday 2 PM–11 PM.', 4)
) AS seed(question_fa, question_ar, question_en, answer_fa, answer_ar, answer_en, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.faq_items);
