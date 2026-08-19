import type { Locale } from "@/i18n/config";

export type Messages = {
  brand: { name: string; nameLocal: string; currency: string };
  nav: {
    home: string;
    categories: string;
    search: string;
    orders: string;
    account: string;
    cart: string;
    searchShortcut: string;
  };
  home: {
    deliverTo: string;
    locationSample: string;
    searchPlaceholder: string;
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    heroCta: string;
    flashDeals: string;
    flashEnds: string;
    categoriesTitle: string;
    viewAll: string;
    allProducts: string;
    loadingProducts: string;
    noProducts: string;
    fallbackProduce: string;
    fallbackDairy: string;
    fallbackMeat: string;
    fallbackBakery: string;
  };
  product: {
    inStock: string;
    outOfStock: string;
    description: string;
    noDescription: string;
    addToCart: string;
    fallbackName: string;
  };
  cart: {
    title: string;
    empty: string;
    backToStore: string;
    freeDeliveryProgress: string;
    freeDeliveryHighlight: string;
    subtotal: string;
    deliveryFee: string;
    free: string;
    vat: string;
    total: string;
    continueCheckout: string;
  };
  checkout: {
    emptyCart: string;
    back: string;
    backToCart: string;
    loginTitle: string;
    loginSubtitle: string;
    phonePlaceholder: string;
    getCode: string;
    otpPlaceholder: string;
    confirm: string;
    title: string;
    addressTitle: string;
    change: string;
    noAddress: string;
    labelPlaceholder: string;
    addressPlaceholder: string;
    addAddress: string;
    deliveryTimeTitle: string;
    deliverySlots: string[];
    paymentTitle: string;
    paymentOnline: string;
    paymentCash: string;
    summaryTitle: string;
    subtotal: string;
    delivery: string;
    vat: string;
    total: string;
    submitOrder: string;
  };
  search: {
    title: string;
    placeholder: string;
    noResults: string;
    hintPrefix: string;
    hintCategories: string;
    hintSuffix: string;
  };
  categories: {
    title: string;
    searchInCategories: string;
    back: string;
  };
  account: {
    title: string;
    defaultUser: string;
    myOrders: string;
    adminPanel: string;
    signOut: string;
    loginTitle: string;
    loginSubtitle: string;
    phonePlaceholder: string;
    getCode: string;
    otpPlaceholder: string;
    confirm: string;
  };
  orders: {
    title: string;
    loading: string;
    empty: string;
    startShopping: string;
    status: Record<string, string>;
    tracking: Record<string, string>;
    stepper: Record<string, string>;
  };
  common: {
    loading: string;
    back: string;
    free: string;
    error: string;
  };
  notifications: {
    otpSent: string;
    loginSuccess: string;
    addressSaved: string;
    orderPlaced: string;
  };
  store: {
    cartDisabled: string;
    cartClosedTitle: string;
    cartClosedDesc: string;
    pricesHidden: string;
  };
};

const fa: Messages = {
  brand: { name: "EliMarket", nameLocal: "EliMarket", currency: "تومان" },
  nav: {
    home: "خانه",
    categories: "دسته‌ها",
    search: "جستجو",
    orders: "سفارش‌ها",
    account: "حساب",
    cart: "سبد خرید",
    searchShortcut: "جستجو",
  },
  home: {
    deliverTo: "تحویل به",
    locationSample: "تهران، سعادت‌آباد",
    searchPlaceholder: "جستجوی محصول…",
    heroBadge: "پیشنهاد ویژه",
    heroTitle: "مواد تازه روزانه",
    heroSubtitle: "ارسال سریع تا ۲ ساعت",
    heroCta: "خرید کنید",
    flashDeals: "پیشنهاد لحظه‌ای",
    flashEnds: "پایان: ۰۲:۴۵:۱۸",
    categoriesTitle: "خرید بر اساس دسته",
    viewAll: "مشاهده همه",
    allProducts: "همه محصولات",
    loadingProducts: "در حال بارگذاری محصولات…",
    noProducts: "محصولی یافت نشد.",
    fallbackProduce: "میوه و سبزی",
    fallbackDairy: "لبنیات",
    fallbackMeat: "گوشت",
    fallbackBakery: "نانوایی",
  },
  product: {
    inStock: "✓ موجود",
    outOfStock: "ناموجود",
    description: "توضیحات",
    noDescription: "توضیحاتی برای این محصول ثبت نشده است.",
    addToCart: "افزودن به سبد — {price}",
    fallbackName: "محصول",
  },
  cart: {
    title: "سبد خرید من",
    empty: "سبد خرید شما خالی است",
    backToStore: "بازگشت به فروشگاه",
    freeDeliveryProgress: "{amount} تا {highlight}",
    freeDeliveryHighlight: "ارسال رایگان",
    subtotal: "جمع جزء",
    deliveryFee: "هزینه ارسال",
    free: "رایگان",
    vat: "مالیات ({percent}٪)",
    total: "جمع کل",
    continueCheckout: "ادامه تسویه",
  },
  checkout: {
    emptyCart: "سبد خرید خالی است",
    back: "بازگشت",
    backToCart: "سبد خرید",
    loginTitle: "ورود برای تکمیل سفارش",
    loginSubtitle: "شماره موبایل + کد یکبار مصرف",
    phonePlaceholder: "۰۹۱۲۳۴۵۶۷۸۹",
    getCode: "دریافت کد",
    otpPlaceholder: "کد ۶ رقمی",
    confirm: "تأیید",
    title: "تسویه حساب",
    addressTitle: "آدرس تحویل",
    change: "تغییر",
    noAddress: "آدرسی انتخاب نشده",
    labelPlaceholder: "برچسب (منزل)",
    addressPlaceholder: "آدرس کامل",
    addAddress: "+ آدرس جدید",
    deliveryTimeTitle: "زمان تحویل",
    deliverySlots: [
      "امروز ۱۲:۰۰ – ۱۴:۰۰",
      "امروز ۱۴:۰۰ – ۱۶:۰۰",
      "امروز ۱۶:۰۰ – ۱۸:۰۰",
      "فردا ۱۰:۰۰ – ۱۲:۰۰",
    ],
    paymentTitle: "روش پرداخت",
    paymentOnline: "پرداخت آنلاین",
    paymentCash: "پرداخت در محل",
    summaryTitle: "خلاصه سفارش",
    subtotal: "جمع جزء",
    delivery: "ارسال",
    vat: "مالیات",
    total: "جمع کل",
    submitOrder: "ثبت سفارش — {price}",
  },
  search: {
    title: "جستجو",
    placeholder: "نام محصول را بنویسید…",
    noResults: "نتیجه‌ای یافت نشد",
    hintPrefix: "یا از",
    hintCategories: "دسته‌بندی‌ها",
    hintSuffix: "شروع کنید",
  },
  categories: {
    title: "دسته‌بندی‌ها",
    searchInCategories: "جستجو در دسته‌ها",
    back: "دسته‌ها",
  },
  account: {
    title: "حساب کاربری",
    defaultUser: "کاربر",
    myOrders: "سفارش‌های من",
    adminPanel: "پنل ادمین",
    signOut: "خروج از حساب",
    loginTitle: "ورود / ثبت‌نام",
    loginSubtitle: "ورود با شماره موبایل و کد یکبار مصرف",
    phonePlaceholder: "۰۹۱۲۳۴۵۶۷۸۹",
    getCode: "دریافت کد",
    otpPlaceholder: "کد ۶ رقمی",
    confirm: "تأیید",
  },
  orders: {
    title: "سفارش‌های من",
    loading: "بارگذاری…",
    empty: "هنوز سفارشی ثبت نکرده‌اید",
    startShopping: "شروع خرید",
    status: {
      pending: "در انتظار",
      confirmed: "تأیید شده",
      preparing: "آماده‌سازی",
      out_for_delivery: "در مسیر",
      delivered: "تحویل شده",
      cancelled: "لغو شده",
    },
    tracking: {
      pending: "در انتظار تأیید",
      confirmed: "تأیید شده",
      preparing: "در حال آماده‌سازی",
      out_for_delivery: "در مسیر تحویل",
      delivered: "تحویل شده",
      cancelled: "لغو شده",
      backToOrders: "سفارش‌ها",
      help: "راهنما",
      orderNumber: "سفارش #{id}",
      estimatedDelivery: "تحویل تقریبی: {slot}",
      itemCount: "{count} قلم سفارش",
      callDriver: "تماس با پیک",
      loading: "در حال بارگذاری…",
      error: "خطا",
      back: "بازگشت",
    },
    stepper: {
      confirmed: "تأیید",
      preparing: "آماده‌سازی",
      out_for_delivery: "در مسیر",
      delivered: "تحویل",
    },
  },
  common: {
    loading: "بارگذاری…",
    back: "بازگشت",
    free: "رایگان",
    error: "خطا",
  },
  notifications: {
    otpSent: "کد ارسال شد",
    loginSuccess: "ورود موفق",
    addressSaved: "آدرس ثبت شد",
    orderPlaced: "سفارش ثبت شد",
  },
  store: {
    cartDisabled: "سبد خرید در حال حاضر غیرفعال است — نمایش قیمت توسط فروشگاه خاموش شده است.",
    cartClosedTitle: "سبد خرید بسته است",
    cartClosedDesc: "در حال حاضر قیمت‌ها نمایش داده نمی‌شوند و امکان خرید آنلاین وجود ندارد.",
    pricesHidden: "تماس بگیرید",
  },
};

const ar: Messages = {
  brand: { name: "EliMarket", nameLocal: "EliMarket", currency: "تومان" },
  nav: {
    home: "الرئيسية",
    categories: "الفئات",
    search: "بحث",
    orders: "الطلبات",
    account: "الحساب",
    cart: "سلة التسوق",
    searchShortcut: "بحث",
  },
  home: {
    deliverTo: "التوصيل إلى",
    locationSample: "طهران، سعادت آباد",
    searchPlaceholder: "البحث عن منتج…",
    heroBadge: "عرض خاص",
    heroTitle: "مواد طازجة يومياً",
    heroSubtitle: "توصيل سريع خلال ساعتين",
    heroCta: "تسوق الآن",
    flashDeals: "عروض لحظية",
    flashEnds: "ينتهي: ٠٢:٤٥:١٨",
    categoriesTitle: "تسوق حسب الفئة",
    viewAll: "عرض الكل",
    allProducts: "جميع المنتجات",
    loadingProducts: "جاري تحميل المنتجات…",
    noProducts: "لم يتم العثور على منتجات.",
    fallbackProduce: "فواكه وخضروات",
    fallbackDairy: "ألبان",
    fallbackMeat: "لحوم",
    fallbackBakery: "مخبوزات",
  },
  product: {
    inStock: "✓ متوفر",
    outOfStock: "غير متوفر",
    description: "الوصف",
    noDescription: "لا يوجد وصف لهذا المنتج.",
    addToCart: "أضف إلى السلة — {price}",
    fallbackName: "منتج",
  },
  cart: {
    title: "سلة التسوق",
    empty: "سلة التسوق فارغة",
    backToStore: "العودة إلى المتجر",
    freeDeliveryProgress: "{amount} حتى {highlight}",
    freeDeliveryHighlight: "توصيل مجاني",
    subtotal: "المجموع الفرعي",
    deliveryFee: "رسوم التوصيل",
    free: "مجاني",
    vat: "الضريبة ({percent}٪)",
    total: "الإجمالي",
    continueCheckout: "متابعة الدفع",
  },
  checkout: {
    emptyCart: "سلة التسوق فارغة",
    back: "رجوع",
    backToCart: "سلة التسوق",
    loginTitle: "تسجيل الدخول لإتمام الطلب",
    loginSubtitle: "رقم الجوال + رمز لمرة واحدة",
    phonePlaceholder: "٠٩١٢٣٤٥٦٧٨٩",
    getCode: "استلام الرمز",
    otpPlaceholder: "رمز ٦ أرقام",
    confirm: "تأكيد",
    title: "إتمام الشراء",
    addressTitle: "عنوان التوصيل",
    change: "تغيير",
    noAddress: "لم يتم اختيار عنوان",
    labelPlaceholder: "التسمية (المنزل)",
    addressPlaceholder: "العنوان الكامل",
    addAddress: "+ عنوان جديد",
    deliveryTimeTitle: "وقت التوصيل",
    deliverySlots: [
      "اليوم ١٢:٠٠ – ١٤:٠٠",
      "اليوم ١٤:٠٠ – ١٦:٠٠",
      "اليوم ١٦:٠٠ – ١٨:٠٠",
      "غداً ١٠:٠٠ – ١٢:٠٠",
    ],
    paymentTitle: "طريقة الدفع",
    paymentOnline: "دفع إلكتروني",
    paymentCash: "الدفع عند الاستلام",
    summaryTitle: "ملخص الطلب",
    subtotal: "المجموع الفرعي",
    delivery: "التوصيل",
    vat: "الضريبة",
    total: "الإجمالي",
    submitOrder: "تأكيد الطلب — {price}",
  },
  search: {
    title: "بحث",
    placeholder: "اكتب اسم المنتج…",
    noResults: "لا توجد نتائج",
    hintPrefix: "أو ابدأ من",
    hintCategories: "الفئات",
    hintSuffix: "",
  },
  categories: {
    title: "الفئات",
    searchInCategories: "بحث في الفئات",
    back: "الفئات",
  },
  account: {
    title: "حسابي",
    defaultUser: "مستخدم",
    myOrders: "طلباتي",
    adminPanel: "لوحة الإدارة",
    signOut: "تسجيل الخروج",
    loginTitle: "تسجيل الدخول / التسجيل",
    loginSubtitle: "الدخول برقم الجوال ورمز لمرة واحدة",
    phonePlaceholder: "٠٩١٢٣٤٥٦٧٨٩",
    getCode: "استلام الرمز",
    otpPlaceholder: "رمز ٦ أرقام",
    confirm: "تأكيد",
  },
  orders: {
    title: "طلباتي",
    loading: "جاري التحميل…",
    empty: "لم تقم بأي طلب بعد",
    startShopping: "ابدأ التسوق",
    status: {
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      preparing: "قيد التحضير",
      out_for_delivery: "في الطريق",
      delivered: "تم التسليم",
      cancelled: "ملغى",
    },
    tracking: {
      pending: "في انتظار التأكيد",
      confirmed: "مؤكد",
      preparing: "قيد التحضير",
      out_for_delivery: "في طريق التوصيل",
      delivered: "تم التسليم",
      cancelled: "ملغى",
      backToOrders: "الطلبات",
      help: "مساعدة",
      orderNumber: "طلب #{id}",
      estimatedDelivery: "التوصيل المتوقع: {slot}",
      itemCount: "{count} عناصر",
      callDriver: "اتصل بالسائق",
      loading: "جاري التحميل…",
      error: "خطأ",
      back: "رجوع",
    },
    stepper: {
      confirmed: "تأكيد",
      preparing: "تحضير",
      out_for_delivery: "في الطريق",
      delivered: "تسليم",
    },
  },
  common: {
    loading: "جاري التحميل…",
    back: "رجوع",
    free: "مجاني",
    error: "خطأ",
  },
  notifications: {
    otpSent: "تم إرسال الرمز",
    loginSuccess: "تم تسجيل الدخول",
    addressSaved: "تم حفظ العنوان",
    orderPlaced: "تم تسجيل الطلب",
  },
  store: {
    cartDisabled: "سلة التسوق معطلة حالياً — تم إيقاف عرض الأسعار.",
    cartClosedTitle: "سلة التسوق مغلقة",
    cartClosedDesc: "الأسعار مخفية حالياً ولا يمكن إتمام الشراء عبر الإنترنت.",
    pricesHidden: "اتصل بنا",
  },
};

const en: Messages = {
  brand: { name: "EliMarket", nameLocal: "EliMarket", currency: "Toman" },
  nav: {
    home: "Home",
    categories: "Categories",
    search: "Search",
    orders: "Orders",
    account: "Account",
    cart: "Cart",
    searchShortcut: "Search",
  },
  home: {
    deliverTo: "Deliver to",
    locationSample: "Tehran, Saadat Abad",
    searchPlaceholder: "Search products…",
    heroBadge: "Special offer",
    heroTitle: "Fresh daily groceries",
    heroSubtitle: "Fast delivery within 2 hours",
    heroCta: "Shop now",
    flashDeals: "Flash deals",
    flashEnds: "Ends: 02:45:18",
    categoriesTitle: "Shop by category",
    viewAll: "View all",
    allProducts: "All products",
    loadingProducts: "Loading products…",
    noProducts: "No products found.",
    fallbackProduce: "Produce",
    fallbackDairy: "Dairy",
    fallbackMeat: "Meat",
    fallbackBakery: "Bakery",
  },
  product: {
    inStock: "✓ In stock",
    outOfStock: "Out of stock",
    description: "Description",
    noDescription: "No description available for this product.",
    addToCart: "Add to cart — {price}",
    fallbackName: "Product",
  },
  cart: {
    title: "My cart",
    empty: "Your cart is empty",
    backToStore: "Back to store",
    freeDeliveryProgress: "{amount} until {highlight}",
    freeDeliveryHighlight: "free delivery",
    subtotal: "Subtotal",
    deliveryFee: "Delivery fee",
    free: "Free",
    vat: "VAT ({percent}%)",
    total: "Total",
    continueCheckout: "Continue to checkout",
  },
  checkout: {
    emptyCart: "Your cart is empty",
    back: "Back",
    backToCart: "Cart",
    loginTitle: "Sign in to complete order",
    loginSubtitle: "Mobile number + one-time code",
    phonePlaceholder: "09123456789",
    getCode: "Get code",
    otpPlaceholder: "6-digit code",
    confirm: "Confirm",
    title: "Checkout",
    addressTitle: "Delivery address",
    change: "Change",
    noAddress: "No address selected",
    labelPlaceholder: "Label (Home)",
    addressPlaceholder: "Full address",
    addAddress: "+ New address",
    deliveryTimeTitle: "Delivery time",
    deliverySlots: [
      "Today 12:00 – 14:00",
      "Today 14:00 – 16:00",
      "Today 16:00 – 18:00",
      "Tomorrow 10:00 – 12:00",
    ],
    paymentTitle: "Payment method",
    paymentOnline: "Pay online",
    paymentCash: "Cash on delivery",
    summaryTitle: "Order summary",
    subtotal: "Subtotal",
    delivery: "Delivery",
    vat: "VAT",
    total: "Total",
    submitOrder: "Place order — {price}",
  },
  search: {
    title: "Search",
    placeholder: "Type a product name…",
    noResults: "No results found",
    hintPrefix: "Or browse",
    hintCategories: "categories",
    hintSuffix: "to get started",
  },
  categories: {
    title: "Categories",
    searchInCategories: "Search categories",
    back: "Categories",
  },
  account: {
    title: "My account",
    defaultUser: "User",
    myOrders: "My orders",
    adminPanel: "Admin panel",
    signOut: "Sign out",
    loginTitle: "Sign in / Register",
    loginSubtitle: "Sign in with mobile number and one-time code",
    phonePlaceholder: "09123456789",
    getCode: "Get code",
    otpPlaceholder: "6-digit code",
    confirm: "Confirm",
  },
  orders: {
    title: "My orders",
    loading: "Loading…",
    empty: "You haven't placed any orders yet",
    startShopping: "Start shopping",
    status: {
      pending: "Pending",
      confirmed: "Confirmed",
      preparing: "Preparing",
      out_for_delivery: "On the way",
      delivered: "Delivered",
      cancelled: "Cancelled",
    },
    tracking: {
      pending: "Awaiting confirmation",
      confirmed: "Confirmed",
      preparing: "Preparing",
      out_for_delivery: "Out for delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
      backToOrders: "Orders",
      help: "Help",
      orderNumber: "Order #{id}",
      estimatedDelivery: "Estimated delivery: {slot}",
      itemCount: "{count} items",
      callDriver: "Call driver",
      loading: "Loading…",
      error: "Error",
      back: "Back",
    },
    stepper: {
      confirmed: "Confirmed",
      preparing: "Preparing",
      out_for_delivery: "On the way",
      delivered: "Delivered",
    },
  },
  common: {
    loading: "Loading…",
    back: "Back",
    free: "Free",
    error: "Error",
  },
  notifications: {
    otpSent: "Code sent",
    loginSuccess: "Signed in successfully",
    addressSaved: "Address saved",
    orderPlaced: "Order placed",
  },
  store: {
    cartDisabled: "Cart is currently disabled — price display has been turned off.",
    cartClosedTitle: "Cart is closed",
    cartClosedDesc: "Prices are hidden and online checkout is unavailable.",
    pricesHidden: "Contact us",
  },
};

export const messages: Record<Locale, Messages> = { fa, ar, en };

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? messages.fa;
}
