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
    adminLoginSuccess: string;
    productUpdated: string;
    productCreated: string;
    stockUpdated: string;
    productDeleted: string;
    imageUploaded: string;
    coverageSaved: string;
    priceEnabled: string;
    priceDisabled: string;
    riderAssigned: string;
  };
  store: {
    cartDisabled: string;
    cartClosedTitle: string;
    cartClosedDesc: string;
    pricesHidden: string;
  };
  admin: {
    panelLabel: string;
    brandAdmin: string;
    signOut: string;
    closeMenu: string;
    menu: string;
    nav: {
      dashboard: string;
      products: string;
      orders: string;
      reports: string;
      coverage: string;
    };
    login: {
      title: string;
      subtitle: string;
      forbidden: string;
      username: string;
      password: string;
      usernameHint: string;
      submit: string;
    };
    dashboard: {
      title: string;
      productsCard: string;
      productsDesc: string;
      ordersCard: string;
      ordersDesc: string;
      reportsCard: string;
      reportsDesc: string;
      coverageCard: string;
      coverageDesc: string;
    };
    products: {
      title: string;
      subtitle: string;
      newProduct: string;
      editProduct: string;
      namePlaceholder: string;
      slugPlaceholder: string;
      descriptionPlaceholder: string;
      priceLabel: string;
      stockLabel: string;
      noCategory: string;
      imageUrlPlaceholder: string;
      showInStore: string;
      save: string;
      create: string;
      cancel: string;
      aiDescription: string;
      uploadImage: string;
      aiImage: string;
      colImage: string;
      colName: string;
      colPrice: string;
      colStock: string;
      colStatus: string;
      colActions: string;
      active: string;
      inactive: string;
      outOfStock: string;
      edit: string;
      delete: string;
      filterAll: string;
      filterActive: string;
      filterInactive: string;
      entityName: string;
      validationName: string;
      validationSlug: string;
    };
    orders: {
      title: string;
      loading: string;
      empty: string;
      orderPrefix: string;
      riderPlaceholder: string;
      assignRider: string;
      status: Record<string, string>;
    };
    reports: {
      title: string;
      subtitle: string;
      loading: string;
      deliveredRevenue: string;
      pendingRevenue: string;
      cashPayment: string;
      onlinePayment: string;
      ordersCount: string;
      activeOrders: string;
      revenue14Days: string;
      noData: string;
      lowStock: string;
      manageProducts: string;
      allStockOk: string;
      recentOrders: string;
      colId: string;
      colDate: string;
      colStatus: string;
      colPayment: string;
      colAmount: string;
      entityName: string;
      units: string;
    };
    coverage: {
      title: string;
      hint: string;
      storeNamePlaceholder: string;
      defaultStoreName: string;
      save: string;
      clear: string;
      loadingMap: string;
    };
    priceToggle: {
      title: string;
      onDesc: string;
      offDesc: string;
      on: string;
      off: string;
    };
    payment: {
      cash: string;
      online: string;
    };
    status: Record<string, string>;
  };
  table: {
    searchDefault: string;
    searchIn: string;
    filterDefault: string;
    filterColumn: string;
    columnFilter: string;
    clear: string;
    close: string;
    refresh: string;
    export: string;
    columns: string;
    columnManagement: string;
    columnFilters: string;
    create: string;
    loading: string;
    noData: string;
    closeDetails: string;
    showMore: string;
    pageSize: string;
    prev: string;
    next: string;
    showing: string;
    to: string;
    of: string;
    resizeColumn: string;
    defaultEntity: string;
  };
  validation: {
    required: string;
  };
  meta: {
    siteDescription: string;
    storefrontTitle: string;
    productFallback: string;
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
    adminLoginSuccess: "ورود موفق",
    productUpdated: "محصول ویرایش شد",
    productCreated: "محصول ایجاد شد",
    stockUpdated: "موجودی به‌روز شد",
    productDeleted: "حذف شد",
    imageUploaded: "تصویر آپلود شد",
    coverageSaved: "محدوده ذخیره شد",
    priceEnabled: "نمایش قیمت فعال شد",
    priceDisabled: "نمایش قیمت غیرفعال شد",
    riderAssigned: "پیک تخصیص یافت",
  },
  store: {
    cartDisabled: "سبد خرید در حال حاضر غیرفعال است — نمایش قیمت توسط فروشگاه خاموش شده است.",
    cartClosedTitle: "سبد خرید بسته است",
    cartClosedDesc: "در حال حاضر قیمت‌ها نمایش داده نمی‌شوند و امکان خرید آنلاین وجود ندارد.",
    pricesHidden: "تماس بگیرید",
  },
  admin: {
    panelLabel: "پنل مدیریت",
    brandAdmin: "EliMarket Admin",
    signOut: "خروج",
    closeMenu: "بستن منو",
    menu: "منو",
    nav: {
      dashboard: "داشبورد",
      products: "محصولات",
      orders: "سفارش‌ها",
      reports: "گزارشات مالی",
      coverage: "محدوده پوشش",
    },
    login: {
      title: "ورود پنل مدیریت",
      subtitle: "ورود با نام کاربری و رمز عبور",
      forbidden: "حساب شما دسترسی ادمین ندارد.",
      username: "نام کاربری",
      password: "رمز عبور",
      usernameHint: "",
      submit: "ورود",
    },
    dashboard: {
      title: "داشبورد",
      productsCard: "مدیریت محصولات",
      productsDesc: "افزودن، تصویر، موجودی",
      ordersCard: "مدیریت سفارش‌ها",
      ordersDesc: "وضعیت و پیک",
      reportsCard: "گزارشات مالی",
      reportsDesc: "درآمد و موجودی کم",
      coverageCard: "محدوده پوشش",
      coverageDesc: "نقشه تحویل",
    },
    products: {
      title: "مدیریت محصولات",
      subtitle: "افزودن محصول، بارگذاری تصویر و کنترل موجودی",
      newProduct: "محصول جدید",
      editProduct: "ویرایش محصول",
      namePlaceholder: "نام محصول",
      slugPlaceholder: "slug-en",
      descriptionPlaceholder: "توضیحات",
      priceLabel: "قیمت (تومان)",
      stockLabel: "موجودی",
      noCategory: "بدون دسته",
      imageUrlPlaceholder: "URL تصویر (یا آپلود کنید)",
      showInStore: "نمایش در فروشگاه",
      save: "ذخیره",
      create: "ایجاد محصول",
      cancel: "انصراف",
      aiDescription: "AI توضیحات",
      uploadImage: "آپلود تصویر",
      aiImage: "AI تصویر",
      colImage: "تصویر",
      colName: "نام",
      colPrice: "قیمت",
      colStock: "موجودی",
      colStatus: "وضعیت",
      colActions: "عملیات",
      active: "فعال",
      inactive: "غیرفعال",
      outOfStock: "ناموجود",
      edit: "ویرایش",
      delete: "حذف",
      filterAll: "همه",
      filterActive: "فعال",
      filterInactive: "غیرفعال",
      entityName: "محصولات",
      validationName: "نام الزامی است",
      validationSlug: "اسلاگ الزامی است",
    },
    orders: {
      title: "سفارش‌ها",
      loading: "بارگذاری…",
      empty: "سفارشی یافت نشد.",
      orderPrefix: "سفارش",
      riderPlaceholder: "UUID پیک",
      assignRider: "تخصیص پیک",
      status: {
        pending: "در انتظار",
        confirmed: "تأیید",
        preparing: "آماده‌سازی",
        out_for_delivery: "ارسال",
        delivered: "تحویل",
        cancelled: "لغو",
      },
    },
    reports: {
      title: "گزارشات مالی",
      subtitle: "درآمد، سفارش‌ها و موجودی",
      loading: "بارگذاری گزارش…",
      deliveredRevenue: "درآمد تحویل‌شده",
      pendingRevenue: "درآمد در انتظار",
      cashPayment: "پرداخت نقدی",
      onlinePayment: "پرداخت آنلاین",
      ordersCount: "{count} سفارش",
      activeOrders: "{count} سفارش فعال",
      revenue14Days: "درآمد ۱۴ روز اخیر",
      noData: "داده‌ای موجود نیست",
      lowStock: "موجودی کم",
      manageProducts: "مدیریت محصولات",
      allStockOk: "همه محصولات موجودی کافی دارند",
      recentOrders: "آخرین سفارش‌ها",
      colId: "شناسه",
      colDate: "تاریخ",
      colStatus: "وضعیت",
      colPayment: "پرداخت",
      colAmount: "مبلغ",
      entityName: "سفارش‌ها",
      units: "عدد",
    },
    coverage: {
      title: "محدوده پوشش",
      hint: "روی نقشه کلیک کنید تا رئوس چندضلعی را اضافه کنید. حداقل ۳ نقطه لازم است.",
      storeNamePlaceholder: "نام فروشگاه",
      defaultStoreName: "فروشگاه مرکزی",
      save: "ذخیره محدوده",
      clear: "پاک کردن",
      loadingMap: "بارگذاری نقشه…",
    },
    priceToggle: {
      title: "نمایش قیمت در فروشگاه",
      onDesc: "قیمت‌ها و سبد خرید برای مشتریان فعال است",
      offDesc: "قیمت‌ها مخفی و سبد خرید غیرفعال است",
      on: "قیمت: روشن",
      off: "قیمت: خاموش",
    },
    payment: { cash: "نقدی", online: "آنلاین" },
    status: {
      pending: "در انتظار",
      confirmed: "تأیید شده",
      preparing: "آماده‌سازی",
      out_for_delivery: "در مسیر",
      delivered: "تحویل شده",
      cancelled: "لغو شده",
    },
  },
  table: {
    searchDefault: "جستجو…",
    searchIn: "جستجو در {entity}…",
    filterDefault: "فیلتر {column}",
    filterColumn: "فیلتر ستون",
    columnFilter: "فیلتر ستون",
    clear: "پاک کردن",
    close: "بستن",
    refresh: "بروزرسانی",
    export: "اکسپورت",
    columns: "ستون‌ها",
    columnManagement: "مدیریت ستون‌ها",
    columnFilters: "فیلتر ستون‌ها",
    create: "ایجاد",
    loading: "در حال بارگذاری…",
    noData: "داده‌ای یافت نشد",
    closeDetails: "بستن جزئیات",
    showMore: "نمایش {count} مورد دیگر",
    pageSize: "تعداد در صفحه",
    prev: "قبلی",
    next: "بعدی",
    showing: "نمایش",
    to: "تا",
    of: "از",
    resizeColumn: "تغییر عرض ستون {column}",
    defaultEntity: "داده",
  },
  validation: { required: "این فیلد الزامی است" },
  meta: {
    siteDescription: "خرید آنلاین — EliMarket",
    storefrontTitle: "فروشگاه",
    productFallback: "محصول",
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
    adminLoginSuccess: "تم تسجيل الدخول",
    productUpdated: "تم تحديث المنتج",
    productCreated: "تم إنشاء المنتج",
    stockUpdated: "تم تحديث المخزون",
    productDeleted: "تم الحذف",
    imageUploaded: "تم رفع الصورة",
    coverageSaved: "تم حفظ نطاق التغطية",
    priceEnabled: "تم تفعيل عرض الأسعار",
    priceDisabled: "تم إيقاف عرض الأسعار",
    riderAssigned: "تم تعيين السائق",
  },
  store: {
    cartDisabled: "سلة التسوق معطلة حالياً — تم إيقاف عرض الأسعار.",
    cartClosedTitle: "سلة التسوق مغلقة",
    cartClosedDesc: "الأسعار مخفية حالياً ولا يمكن إتمام الشراء عبر الإنترنت.",
    pricesHidden: "اتصل بنا",
  },
  admin: {
    panelLabel: "لوحة الإدارة",
    brandAdmin: "EliMarket Admin",
    signOut: "تسجيل الخروج",
    closeMenu: "إغلاق القائمة",
    menu: "القائمة",
    nav: {
      dashboard: "لوحة التحكم",
      products: "المنتجات",
      orders: "الطلبات",
      reports: "التقارير المالية",
      coverage: "نطاق التغطية",
    },
    login: {
      title: "دخول لوحة الإدارة",
      subtitle: "الدخول باسم المستخدم وكلمة المرور",
      forbidden: "حسابك لا يملك صلاحية الإدارة.",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      usernameHint: "",
      submit: "دخول",
    },
    dashboard: {
      title: "لوحة التحكم",
      productsCard: "إدارة المنتجات",
      productsDesc: "إضافة، صورة، مخزون",
      ordersCard: "إدارة الطلبات",
      ordersDesc: "الحالة والسائق",
      reportsCard: "التقارير المالية",
      reportsDesc: "الإيرادات والمخزون المنخفض",
      coverageCard: "نطاق التغطية",
      coverageDesc: "خريطة التوصيل",
    },
    products: {
      title: "إدارة المنتجات",
      subtitle: "إضافة منتج، رفع صورة والتحكم بالمخزون",
      newProduct: "منتج جديد",
      editProduct: "تعديل المنتج",
      namePlaceholder: "اسم المنتج",
      slugPlaceholder: "slug-en",
      descriptionPlaceholder: "الوصف",
      priceLabel: "السعر (تومان)",
      stockLabel: "المخزون",
      noCategory: "بدون فئة",
      imageUrlPlaceholder: "رابط الصورة (أو ارفع ملفاً)",
      showInStore: "عرض في المتجر",
      save: "حفظ",
      create: "إنشاء منتج",
      cancel: "إلغاء",
      aiDescription: "وصف AI",
      uploadImage: "رفع صورة",
      aiImage: "صورة AI",
      colImage: "صورة",
      colName: "الاسم",
      colPrice: "السعر",
      colStock: "المخزون",
      colStatus: "الحالة",
      colActions: "إجراءات",
      active: "نشط",
      inactive: "غير نشط",
      outOfStock: "غير متوفر",
      edit: "تعديل",
      delete: "حذف",
      filterAll: "الكل",
      filterActive: "نشط",
      filterInactive: "غير نشط",
      entityName: "المنتجات",
      validationName: "الاسم مطلوب",
      validationSlug: "الاسلاگ مطلوب",
    },
    orders: {
      title: "الطلبات",
      loading: "جاري التحميل…",
      empty: "لا توجد طلبات.",
      orderPrefix: "طلب",
      riderPlaceholder: "UUID السائق",
      assignRider: "تعيين سائق",
      status: {
        pending: "قيد الانتظار",
        confirmed: "مؤكد",
        preparing: "قيد التحضير",
        out_for_delivery: "في الطريق",
        delivered: "تم التسليم",
        cancelled: "ملغى",
      },
    },
    reports: {
      title: "التقارير المالية",
      subtitle: "الإيرادات والطلبات والمخزون",
      loading: "جاري تحميل التقرير…",
      deliveredRevenue: "إيرادات مسلّمة",
      pendingRevenue: "إيرادات معلّقة",
      cashPayment: "دفع نقدي",
      onlinePayment: "دفع إلكتروني",
      ordersCount: "{count} طلب",
      activeOrders: "{count} طلب نشط",
      revenue14Days: "إيرادات آخر ١٤ يوماً",
      noData: "لا توجد بيانات",
      lowStock: "مخزون منخفض",
      manageProducts: "إدارة المنتجات",
      allStockOk: "جميع المنتجات لديها مخزون كافٍ",
      recentOrders: "آخر الطلبات",
      colId: "المعرف",
      colDate: "التاريخ",
      colStatus: "الحالة",
      colPayment: "الدفع",
      colAmount: "المبلغ",
      entityName: "الطلبات",
      units: "قطعة",
    },
    coverage: {
      title: "نطاق التغطية",
      hint: "انقر على الخريطة لإضافة رؤوس المضلع. يلزم ٣ نقاط على الأقل.",
      storeNamePlaceholder: "اسم المتجر",
      defaultStoreName: "المتجر المركزي",
      save: "حفظ النطاق",
      clear: "مسح",
      loadingMap: "جاري تحميل الخريطة…",
    },
    priceToggle: {
      title: "عرض الأسعار في المتجر",
      onDesc: "الأسعار وسلة التسوق مفعّلة للعملاء",
      offDesc: "الأسعار مخفية وسلة التسوق معطّلة",
      on: "السعر: مفعّل",
      off: "السعر: معطّل",
    },
    payment: { cash: "نقدي", online: "إلكتروني" },
    status: {
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      preparing: "قيد التحضير",
      out_for_delivery: "في الطريق",
      delivered: "تم التسليم",
      cancelled: "ملغى",
    },
  },
  table: {
    searchDefault: "بحث…",
    searchIn: "بحث في {entity}…",
    filterDefault: "تصفية {column}",
    filterColumn: "تصفية العمود",
    columnFilter: "تصفية العمود",
    clear: "مسح",
    close: "إغلاق",
    refresh: "تحديث",
    export: "تصدير",
    columns: "الأعمدة",
    columnManagement: "إدارة الأعمدة",
    columnFilters: "تصفية الأعمدة",
    create: "إنشاء",
    loading: "جاري التحميل…",
    noData: "لا توجد بيانات",
    closeDetails: "إغلاق التفاصيل",
    showMore: "عرض {count} عناصر أخرى",
    pageSize: "عدد في الصفحة",
    prev: "السابق",
    next: "التالي",
    showing: "عرض",
    to: "إلى",
    of: "من",
    resizeColumn: "تغيير عرض العمود {column}",
    defaultEntity: "بيانات",
  },
  validation: { required: "هذا الحقل مطلوب" },
  meta: {
    siteDescription: "تسوق إلكتروني — EliMarket",
    storefrontTitle: "المتجر",
    productFallback: "منتج",
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
    adminLoginSuccess: "Signed in successfully",
    productUpdated: "Product updated",
    productCreated: "Product created",
    stockUpdated: "Stock updated",
    productDeleted: "Deleted",
    imageUploaded: "Image uploaded",
    coverageSaved: "Coverage area saved",
    priceEnabled: "Price display enabled",
    priceDisabled: "Price display disabled",
    riderAssigned: "Rider assigned",
  },
  store: {
    cartDisabled: "Cart is currently disabled — price display has been turned off.",
    cartClosedTitle: "Cart is closed",
    cartClosedDesc: "Prices are hidden and online checkout is unavailable.",
    pricesHidden: "Contact us",
  },
  admin: {
    panelLabel: "Admin panel",
    brandAdmin: "EliMarket Admin",
    signOut: "Sign out",
    closeMenu: "Close menu",
    menu: "Menu",
    nav: {
      dashboard: "Dashboard",
      products: "Products",
      orders: "Orders",
      reports: "Financial reports",
      coverage: "Coverage area",
    },
    login: {
      title: "Admin sign in",
      subtitle: "Sign in with username and password",
      forbidden: "Your account does not have admin access.",
      username: "Username",
      password: "Password",
      usernameHint: "",
      submit: "Sign in",
    },
    dashboard: {
      title: "Dashboard",
      productsCard: "Manage products",
      productsDesc: "Add, images, stock",
      ordersCard: "Manage orders",
      ordersDesc: "Status & riders",
      reportsCard: "Financial reports",
      reportsDesc: "Revenue & low stock",
      coverageCard: "Coverage area",
      coverageDesc: "Delivery map",
    },
    products: {
      title: "Product management",
      subtitle: "Add products, upload images, control stock",
      newProduct: "New product",
      editProduct: "Edit product",
      namePlaceholder: "Product name",
      slugPlaceholder: "slug-en",
      descriptionPlaceholder: "Description",
      priceLabel: "Price (Toman)",
      stockLabel: "Stock",
      noCategory: "No category",
      imageUrlPlaceholder: "Image URL (or upload)",
      showInStore: "Show in store",
      save: "Save",
      create: "Create product",
      cancel: "Cancel",
      aiDescription: "AI description",
      uploadImage: "Upload image",
      aiImage: "AI image",
      colImage: "Image",
      colName: "Name",
      colPrice: "Price",
      colStock: "Stock",
      colStatus: "Status",
      colActions: "Actions",
      active: "Active",
      inactive: "Inactive",
      outOfStock: "Out of stock",
      edit: "Edit",
      delete: "Delete",
      filterAll: "All",
      filterActive: "Active",
      filterInactive: "Inactive",
      entityName: "Products",
      validationName: "Name is required",
      validationSlug: "Slug is required",
    },
    orders: {
      title: "Orders",
      loading: "Loading…",
      empty: "No orders found.",
      orderPrefix: "Order",
      riderPlaceholder: "Rider UUID",
      assignRider: "Assign rider",
      status: {
        pending: "Pending",
        confirmed: "Confirmed",
        preparing: "Preparing",
        out_for_delivery: "Shipping",
        delivered: "Delivered",
        cancelled: "Cancelled",
      },
    },
    reports: {
      title: "Financial reports",
      subtitle: "Revenue, orders and inventory",
      loading: "Loading report…",
      deliveredRevenue: "Delivered revenue",
      pendingRevenue: "Pending revenue",
      cashPayment: "Cash payment",
      onlinePayment: "Online payment",
      ordersCount: "{count} orders",
      activeOrders: "{count} active orders",
      revenue14Days: "Revenue last 14 days",
      noData: "No data available",
      lowStock: "Low stock",
      manageProducts: "Manage products",
      allStockOk: "All products have sufficient stock",
      recentOrders: "Recent orders",
      colId: "ID",
      colDate: "Date",
      colStatus: "Status",
      colPayment: "Payment",
      colAmount: "Amount",
      entityName: "Orders",
      units: "units",
    },
    coverage: {
      title: "Coverage area",
      hint: "Click on the map to add polygon vertices. At least 3 points required.",
      storeNamePlaceholder: "Store name",
      defaultStoreName: "Main store",
      save: "Save coverage",
      clear: "Clear",
      loadingMap: "Loading map…",
    },
    priceToggle: {
      title: "Show prices in store",
      onDesc: "Prices and cart are enabled for customers",
      offDesc: "Prices are hidden and cart is disabled",
      on: "Prices: on",
      off: "Prices: off",
    },
    payment: { cash: "Cash", online: "Online" },
    status: {
      pending: "Pending",
      confirmed: "Confirmed",
      preparing: "Preparing",
      out_for_delivery: "On the way",
      delivered: "Delivered",
      cancelled: "Cancelled",
    },
  },
  table: {
    searchDefault: "Search…",
    searchIn: "Search in {entity}…",
    filterDefault: "Filter {column}",
    filterColumn: "Column filter",
    columnFilter: "Column filter",
    clear: "Clear",
    close: "Close",
    refresh: "Refresh",
    export: "Export",
    columns: "Columns",
    columnManagement: "Manage columns",
    columnFilters: "Column filters",
    create: "Create",
    loading: "Loading…",
    noData: "No data found",
    closeDetails: "Close details",
    showMore: "Show {count} more",
    pageSize: "Rows per page",
    prev: "Previous",
    next: "Next",
    showing: "Showing",
    to: "to",
    of: "of",
    resizeColumn: "Resize column {column}",
    defaultEntity: "Data",
  },
  validation: { required: "This field is required" },
  meta: {
    siteDescription: "Online shopping — EliMarket",
    storefrontTitle: "Store",
    productFallback: "Product",
  },
};

export const messages: Record<Locale, Messages> = { fa, ar, en };

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? messages.fa;
}
