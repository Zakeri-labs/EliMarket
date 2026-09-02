-- Simple tri-lingual blog (fa / ar / en). Admin-managed, storefront-published.
-- Seeded with a few auto-generated posts about the store's location.

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_fa TEXT NOT NULL,
  title_ar TEXT,
  title_en TEXT,
  excerpt_fa TEXT,
  excerpt_ar TEXT,
  excerpt_en TEXT,
  body_fa TEXT NOT NULL,
  body_ar TEXT,
  body_en TEXT,
  cover_url TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS blog_posts_published_idx
  ON public.blog_posts (published, sort_order, published_at DESC);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS blog_posts_select_published ON public.blog_posts;
CREATE POLICY blog_posts_select_published ON public.blog_posts
  FOR SELECT USING (published = TRUE OR public.is_admin());

DROP POLICY IF EXISTS blog_posts_admin_all ON public.blog_posts;
CREATE POLICY blog_posts_admin_all ON public.blog_posts
  FOR ALL USING (public.is_admin());

GRANT SELECT ON TABLE public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.blog_posts TO authenticated;
GRANT ALL ON TABLE public.blog_posts TO service_role;

-- Keep updated_at fresh on every write.
CREATE OR REPLACE FUNCTION public.blog_posts_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS blog_posts_touch_updated_at ON public.blog_posts;
CREATE TRIGGER blog_posts_touch_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.blog_posts_touch_updated_at();

-- --------------------------------------------------------------------------
-- Auto-generated starter posts about the store location
--   Hills Eli Mart · Al Mawaleh, Seeb · Muscat, Oman
--   Pin: https://maps.app.goo.gl/BwBXt5wQCj4sM5NH7  (23.576365, 58.2986085)
-- --------------------------------------------------------------------------
INSERT INTO public.blog_posts (
  slug, sort_order, published_at,
  title_fa, title_ar, title_en,
  excerpt_fa, excerpt_ar, excerpt_en,
  body_fa, body_ar, body_en
) VALUES
(
  'how-to-find-our-store',
  1,
  '2026-08-20T08:00:00Z',
  'چطور به فروشگاه ما برسید',
  'كيف تصل إلى متجرنا',
  'How to find our store',
  'فروشگاه هیلز الی مارت در المولح، سیب است؛ چند دقیقه با بزرگراه مسقط فاصله دارد. مسیر دقیق را از روی نقشه گوگل باز کنید.',
  'يقع متجر هيلز إيلي مارت في المولح بولاية السيب، على بُعد دقائق من طريق مسقط السريع. افتح الموقع على خرائط جوجل للوصول بدقة.',
  'Hills Eli Mart is in Al Mawaleh, Seeb — a few minutes from the Muscat Expressway. Open our Google Maps pin for door-to-door directions.',
  E'## کجا هستیم\nفروشگاه هیلز الی مارت در منطقهٔ المولح، از توابع ولایت سیب و در بخش غربی مسقط قرار دارد. فاصلهٔ کوتاهی با بزرگراه مسقط و مسیر خیابان سلطان قابوس دارد، بنابراین از سیب، المولح، الخوض و بوشر به‌راحتی قابل دسترسی است.\n\n## سریع‌ترین راه مسیریابی\nنشانی ما را روی نقشهٔ گوگل باز کنید تا مسیر را در به در برایتان بکشد: https://maps.app.goo.gl/BwBXt5wQCj4sM5NH7\nاگر ترجیح می‌دهید مختصات را مستقیم وارد کنید، عرض جغرافیایی ۲۳٫۵۷۶۴ و طول جغرافیایی ۵۸٫۲۹۸۶ است.\n\n## پارک خودرو و ورودی\nمقابل فروشگاه جای پارک هست. چرخ‌های خرید کنار درِ ورودی قرار دارند و همکاران ما می‌توانند در حمل سفارش‌های سنگین تا خودرو کمکتان کنند.\n\n## ترجیح می‌دهید در خانه بمانید؟\nاگر نمی‌خواهید رانندگی کنید، ما در سراسر مسقط و سیب سفارش را به دستتان می‌رسانیم. ارسال سفارش‌های بالای ۵٫۰۰۰ ریال عمان رایگان است.',
  E'## أين نحن\nيقع متجر هيلز إيلي مارت في منطقة المولح ضمن ولاية السيب، غربي مسقط. يبعد مسافة قصيرة عن طريق مسقط السريع وشارع السلطان قابوس، فالوصول إليه سهل من السيب والمولح والخوض وبوشر.\n\n## أسرع طريقة للوصول\nافتح موقعنا على خرائط جوجل ليرسم لك المسار حتى الباب: https://maps.app.goo.gl/BwBXt5wQCj4sM5NH7\nوإن كنت تفضّل إدخال الإحداثيات مباشرة فهي: خط العرض 23.5764 وخط الطول 58.2986.\n\n## المواقف والمدخل\nتتوفّر مواقف أمام المتجر مباشرةً. عربات التسوّق عند المدخل، ويسعد فريقنا بمساعدتك في نقل الطلبات الثقيلة إلى سيارتك.\n\n## تفضّل البقاء في المنزل؟\nإن لم ترغب في القيادة، فنحن نوصّل إلى كل أنحاء مسقط والسيب. التوصيل مجاني للطلبات التي تتجاوز 5.000 ريال عُماني.',
  E'## Where we are\nHills Eli Mart is in Al Mawaleh, in the Wilayat of Seeb, on the western side of Muscat. It sits a short drive from the Muscat Expressway and the Sultan Qaboos Street corridor, so it is easy to reach from Seeb, Al Mawaleh, Al Khoud or Bausher.\n\n## The quickest way to navigate\nOpen our pin on Google Maps and let it route you door to door: https://maps.app.goo.gl/BwBXt5wQCj4sM5NH7\nIf you prefer to type coordinates straight into your maps app, they are 23.5764° N, 58.2986° E.\n\n## Parking and the entrance\nThere is space to park directly in front of the store. Trolleys are by the entrance, and our team can help carry heavier orders to your car.\n\n## Prefer to stay home?\nIf you would rather not drive, we deliver across Muscat and Seeb. Orders over OMR 5.000 ship free.'
),
(
  'our-delivery-area',
  2,
  '2026-08-24T08:00:00Z',
  'محدودهٔ ارسال ما در مسقط و سیب',
  'نطاق التوصيل لدينا في مسقط والسيب',
  'Our delivery area around Muscat and Seeb',
  'از فروشگاه ما در المولح به تمام مسقط و سیب ارسال داریم. ببینید محله‌ٔ شما پوشش داده می‌شود یا نه و زمان تقریبی رسیدن سفارش چقدر است.',
  'نوصّل من متجرنا في المولح إلى كل مسقط والسيب. تعرّف إن كان حيّك مشمولًا وكم يستغرق وصول الطلب.',
  'From our store in Al Mawaleh we deliver across Muscat and Seeb. See whether your neighbourhood is covered and how long orders take.',
  E'## از کجا تا کجا\nهمهٔ سفارش‌ها از همین فروشگاه در المولح، سیب آماده و ارسال می‌شوند. چون در قلب کریدور سیب–مسقط هستیم، محله‌های نزدیک مثل المولح، الخوض، المعبیله و الحیل زودتر از همه سفارششان می‌رسد و محله‌های دورتر مسقط هم پوشش داده می‌شوند.\n\n## محلهٔ من پوشش داده می‌شود؟\nهنگام تسویه، نشانی خود را روی نقشه انتخاب کنید؛ اگر داخل محدودهٔ سرویس باشد، هزینه و زمان تقریبی ارسال را همان‌جا می‌بینید. فهرست کامل و به‌روزِ محله‌ها در بخش «تحویل به» بالای صفحه است.\n\n## هزینه و زمان\nارسال سفارش‌های بالای ۵٫۰۰۰ ریال عمان رایگان است و برای سفارش‌های کوچک‌تر هزینهٔ ثابت کمی اضافه می‌شود. زمان رسیدن بسته به محله و شلوغی مسیر متفاوت است و پیش از ثبت نهایی به شما نشان داده می‌شود.\n\n## می‌خواهید حضوری بیایید؟\nنشانی و مسیر فروشگاه را در نوشتهٔ «چطور به فروشگاه ما برسید» گذاشته‌ایم.',
  E'## من أين وإلى أين\nكل الطلبات تُجهّز وتُشحن من متجرنا في المولح بالسيب. ولأننا في قلب محور السيب–مسقط، تصل الطلبات أسرع إلى الأحياء القريبة مثل المولح والخوض والمعبيلة والحيل، كما نغطّي أحياء مسقط الأبعد.\n\n## هل حيّي مشمول؟\nعند إتمام الطلب، حدّد عنوانك على الخريطة؛ فإن كان ضمن نطاق الخدمة ظهرت لك الرسوم والمدة التقديرية مباشرةً. القائمة الكاملة والمحدّثة للأحياء تجدها في زر «التوصيل إلى» أعلى الصفحة.\n\n## الرسوم والمدة\nالتوصيل مجاني للطلبات فوق 5.000 ريال عُماني، وللطلبات الأصغر رسوم ثابتة بسيطة. تختلف مدة الوصول حسب الحي وازدحام الطريق، وتظهر لك قبل تأكيد الطلب.\n\n## تفضّل الزيارة بنفسك؟\nوضعنا العنوان والطريق في مقال «كيف تصل إلى متجرنا».',
  E'## From where to where\nEvery order is packed and shipped from our store in Al Mawaleh, Seeb. Because we sit on the Seeb–Muscat corridor, nearby neighbourhoods such as Al Mawaleh, Al Khoud, Al Maabilah and Al Hail get their orders soonest, and we also cover the wider Muscat area.\n\n## Is my neighbourhood covered?\nAt checkout, drop a pin on your address. If it falls inside our service area, you will see the fee and the estimated delivery time right there. The full, current list of neighbourhoods lives in the "Deliver to" control at the top of the page.\n\n## Fees and timing\nDelivery is free on orders over OMR 5.000; smaller orders carry a small flat fee. Arrival time depends on your neighbourhood and traffic, and is shown to you before you confirm.\n\n## Want to visit in person?\nWe put the address and directions in the post "How to find our store".'
),
(
  'the-neighbourhood-al-mawaleh-seeb',
  3,
  '2026-08-28T08:00:00Z',
  'محلهٔ ما: المولح، سیب',
  'حيّنا: المولح، السيب',
  'The neighbourhood: Al Mawaleh, Seeb',
  'کمی دربارهٔ جایی که فروشگاه در آن است — المولح در ولایت سیب، غرب مسقط، و اینکه چرا برای یک سوپرمارکت محله‌محور انتخاب خوبی است.',
  'نبذة عن المكان الذي يقع فيه المتجر — المولح في ولاية السيب غربي مسقط، ولماذا هو خيار جيد لسوبر ماركت قريب من الحي.',
  'A little about where the store sits — Al Mawaleh in the Wilayat of Seeb, west of Muscat — and why it suits a neighbourhood supermarket.',
  E'## المولح کجاست\nالمولح یکی از محله‌های رو به رشد ولایت سیب در غرب مسقط است؛ ترکیبی از خانه‌های مسکونی، مغازه‌های محلی و دسترسی سریع به بزرگراه مسقط و فرودگاه بین‌المللی مسقط.\n\n## چرا اینجا\nیک سوپرمارکت محله‌محور باید نزدیک مشتری‌هایش باشد. قرار گرفتن در المولح یعنی بیشتر خانواده‌های سیب و اطراف تنها با چند دقیقه رانندگی — یا یک سفارش آنلاین — به خرید روزانه‌شان می‌رسند.\n\n## چه چیزی نزدیک ماست\nمدرسه‌ها، مسجد محله، نانوایی‌ها و داروخانه‌ها همه در همین حدود هستند؛ می‌توانید خرید فروشگاه را با باقی کارهای روزمره‌تان یکجا کنید.\n\n## سری بزنید\nنشانی دقیق و مسیر روی نقشه در نوشتهٔ «چطور به فروشگاه ما برسید» آمده است.',
  E'## أين تقع المولح\nالمولح من الأحياء المتنامية في ولاية السيب غربي مسقط؛ مزيج من المساكن والمحال المحلية مع وصول سريع إلى طريق مسقط السريع ومطار مسقط الدولي.\n\n## لماذا هنا\nالسوبر ماركت القريب من الحي يجب أن يكون قريبًا من زبائنه. وجودنا في المولح يعني أن معظم عائلات السيب وما حولها على بُعد دقائق بالسيارة — أو طلب واحد عبر الإنترنت — من تسوّقهم اليومي.\n\n## ما الذي يجاورنا\nالمدارس ومسجد الحي والمخابز والصيدليات كلها في المحيط نفسه، فيمكنك جمع تسوّق المتجر مع بقية مشاويرك.\n\n## زُرنا\nالعنوان الدقيق والطريق على الخريطة في مقال «كيف تصل إلى متجرنا».',
  E'## Where Al Mawaleh is\nAl Mawaleh is a growing area in the Wilayat of Seeb, west of Muscat — a mix of homes and local shops with quick access to the Muscat Expressway and Muscat International Airport.\n\n## Why here\nA neighbourhood supermarket should be close to the people it serves. Being in Al Mawaleh puts most families in Seeb and nearby just a few minutes'' drive — or one online order — from their everyday shopping.\n\n## What is close by\nSchools, the local mosque, bakeries and pharmacies are all within the same stretch, so you can combine a shop with the rest of your errands.\n\n## Come by\nThe exact address and map directions are in the post "How to find our store".'
)
ON CONFLICT (slug) DO NOTHING;

NOTIFY pgrst, 'reload schema';
