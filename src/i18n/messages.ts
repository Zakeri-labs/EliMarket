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
    heroSlide2Badge: string;
    heroSlide2Title: string;
    heroSlide2Subtitle: string;
    heroSlide3Badge: string;
    heroSlide3Title: string;
    heroSlide3Subtitle: string;
    heroCarouselLabel: string;
    heroPrev: string;
    heroNext: string;
    heroGoToSlide: string;
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
    brand: string;
    features: string;
    noFeatures: string;
    addToCart: string;
    addToCartSimple: string;
    fallbackName: string;
    vatIncluded: string;
    quantity: string;
    share: string;
    wishlist: string;
  };
  cart: {
    title: string;
    titleWithCount: string;
    empty: string;
    backToStore: string;
    clear: string;
    freeDeliveryProgress: string;
    freeDeliveryUnlocked: string;
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
    language: string;
  };
  notifications: {
    successTitle: string;
    errorTitle: string;
    infoTitle: string;
    warningTitle: string;
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
    categoryUpdated: string;
    categoryCreated: string;
    categoryDeleted: string;
    brandCreated: string;
    brandUpdated: string;
    brandDeleted: string;
    heroUpdated: string;
  };
  errors: {
    operationFailed: string;
    unexpectedError: string;
    done: string;
    warning: string;
    otpSendFailed: string;
    loginFailed: string;
    invalidOtp: string;
    adminForbidden: string;
    invalidCredentials: string;
    signOutFailed: string;
    productsLoadFailed: string;
    categoriesLoadFailed: string;
    productNotFound: string;
    adminProductsLoadFailed: string;
    productCreateFailed: string;
    productUpdateFailed: string;
    productDeleteFailed: string;
    noFileSelected: string;
    imageUploadFailed: string;
    fileTooLarge: string;
    ordersLoadFailed: string;
    orderNotFound: string;
    accessDenied: string;
    cartDisabled: string;
    emptyCart: string;
    invalidProduct: string;
    insufficientStock: string;
    orderCreateFailed: string;
    riderAssignFailed: string;
    ridersLoadFailed: string;
    statusUpdateFailed: string;
    reportLoadFailed: string;
    settingsLoadFailed: string;
    settingsUpdateFailed: string;
    priceToggleFailed: string;
    categoryCreateFailed: string;
    categoryUpdateFailed: string;
    categoryDeleteFailed: string;
    brandCreateFailed: string;
    brandUpdateFailed: string;
    brandDeleteFailed: string;
    brandsLoadFailed: string;
    heroUpdateFailed: string;
    addressesLoadFailed: string;
    addressSaveFailed: string;
    aiImageFailed: string;
    aiDescriptionFailed: string;
    storeLoadFailed: string;
    coverageSaveFailed: string;
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
      categories: string;
      brands: string;
      banners: string;
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
      categoriesCard: string;
      categoriesDesc: string;
      brandsCard: string;
      brandsDesc: string;
      bannersCard: string;
      bannersDesc: string;
    };
    products: {
      title: string;
      subtitle: string;
      newProduct: string;
      editProduct: string;
      namePlaceholder: string;
      slugPlaceholder: string;
      descriptionPlaceholder: string;
      descriptionSection: string;
      descriptionFa: string;
      descriptionAr: string;
      descriptionEn: string;
      aiDescriptionAll: string;
      priceLabel: string;
      stockLabel: string;
      noCategory: string;
      brandLabel: string;
      noBrand: string;
      featuresSection: string;
      featureLabelPlaceholder: string;
      featureValuePlaceholder: string;
      addFeature: string;
      removeFeature: string;
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
      aiStubDescription: string;
      aiStubCategorySuffix: string;
    };
    brands: {
      title: string;
      subtitle: string;
      newBrand: string;
      editBrand: string;
      namePlaceholder: string;
      slugPlaceholder: string;
      logoUrlPlaceholder: string;
      sortOrderLabel: string;
      save: string;
      create: string;
      cancel: string;
      edit: string;
      delete: string;
      loading: string;
      empty: string;
      validationName: string;
      validationSlug: string;
    };
    categories: {
      title: string;
      subtitle: string;
      newCategory: string;
      editCategory: string;
      namePlaceholder: string;
      slugPlaceholder: string;
      sortOrderLabel: string;
      imageUrlPlaceholder: string;
      uploadImage: string;
      removeImage: string;
      save: string;
      create: string;
      cancel: string;
      edit: string;
      delete: string;
      loading: string;
      empty: string;
      validationName: string;
      validationSlug: string;
    };
    banners: {
      title: string;
      subtitle: string;
      formTitle: string;
      formHint: string;
      badgePlaceholder: string;
      titlePlaceholder: string;
      subtitlePlaceholder: string;
      ctaLabelPlaceholder: string;
      ctaHrefPlaceholder: string;
      imageUrlPlaceholder: string;
      uploadImage: string;
      removeImage: string;
      save: string;
      previewTitle: string;
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
    homeTitle: string;
    homeOgDescription: string;
    categoryDescription: string;
    notFoundTitle: string;
    notFoundMessage: string;
    backToHome: string;
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
    heroSlide2Badge: "تخفیف ویژه",
    heroSlide2Title: "لبنیات تازه هر روز",
    heroSlide2Subtitle: "تا ۲۵٪ تخفیف روی محصولات منتخب",
    heroSlide3Badge: "ارسال رایگان",
    heroSlide3Title: "خرید بالای ۵۰۰ هزار تومان",
    heroSlide3Subtitle: "تحویل سریع در محدوده شهر",
    heroCarouselLabel: "بنرهای فروشگاه",
    heroPrev: "اسلاید قبلی",
    heroNext: "اسلاید بعدی",
    heroGoToSlide: "رفتن به اسلاید {n}",
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
    inStock: "موجود",
    outOfStock: "ناموجود",
    description: "توضیحات",
    noDescription: "توضیحاتی برای این محصول ثبت نشده است.",
    brand: "برند",
    features: "ویژگی‌ها",
    noFeatures: "ویژگی‌ای ثبت نشده است.",
    addToCart: "افزودن به سبد — {price}",
    addToCartSimple: "افزودن به سبد",
    fallbackName: "محصول",
    vatIncluded: "شامل مالیات",
    quantity: "تعداد",
    share: "اشتراک‌گذاری",
    wishlist: "علاقه‌مندی",
  },
  cart: {
    title: "سبد خرید من",
    titleWithCount: "سبد خرید من ({count})",
    empty: "سبد خرید شما خالی است",
    backToStore: "بازگشت به فروشگاه",
    clear: "خالی کردن",
    freeDeliveryProgress: "{amount} تا {highlight}",
    freeDeliveryUnlocked: "ارسال رایگان فعال شد",
    freeDeliveryHighlight: "ارسال رایگان",
    subtotal: "جمع جزء",
    deliveryFee: "هزینه ارسال",
    free: "رایگان",
    vat: "مالیات ({percent}٪)",
    total: "جمع کل",
    continueCheckout: "تسویه",
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
    language: "زبان",
  },
  notifications: {
    successTitle: "موفق",
    errorTitle: "خطا",
    infoTitle: "اطلاعات",
    warningTitle: "هشدار",
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
    categoryUpdated: "دسته به‌روز شد",
    categoryCreated: "دسته ایجاد شد",
    categoryDeleted: "دسته حذف شد",
    brandCreated: "برند ایجاد شد",
    brandUpdated: "برند به‌روزرسانی شد",
    brandDeleted: "برند حذف شد",
    heroUpdated: "بنر ذخیره شد",
  },
  errors: {
    operationFailed: "عملیات ناموفق بود",
    unexpectedError: "خطای غیرمنتظره",
    done: "انجام شد",
    warning: "هشدار",
    otpSendFailed: "ارسال کد تأیید ناموفق بود",
    loginFailed: "ورود ناموفق بود",
    invalidOtp: "کد تأیید نامعتبر است",
    adminForbidden: "این حساب دسترسی ادمین ندارد",
    invalidCredentials: "نام کاربری یا رمز عبور اشتباه است",
    signOutFailed: "خروج ناموفق بود",
    productsLoadFailed: "بارگذاری محصولات ناموفق بود",
    categoriesLoadFailed: "بارگذاری دسته‌بندی‌ها ناموفق بود",
    productNotFound: "محصول یافت نشد",
    adminProductsLoadFailed: "بارگذاری محصولات ادمین ناموفق بود",
    productCreateFailed: "ایجاد محصول ناموفق بود",
    productUpdateFailed: "ویرایش محصول ناموفق بود",
    productDeleteFailed: "حذف محصول ناموفق بود",
    noFileSelected: "فایلی انتخاب نشده است",
    imageUploadFailed: "آپلود تصویر ناموفق بود",
    fileTooLarge: "حجم تصویر بیش از ۱۵ مگابایت است",
    ordersLoadFailed: "بارگذاری سفارش‌ها ناموفق بود",
    orderNotFound: "سفارش یافت نشد",
    accessDenied: "دسترسی مجاز نیست",
    cartDisabled: "ثبت سفارش در حالت مخفی بودن قیمت غیرفعال است",
    emptyCart: "سبد خرید خالی است",
    invalidProduct: "محصول نامعتبر است",
    insufficientStock: "موجودی کافی نیست",
    orderCreateFailed: "ثبت سفارش ناموفق بود",
    riderAssignFailed: "تخصیص پیک ناموفق بود",
    ridersLoadFailed: "بارگذاری پیک‌ها ناموفق بود",
    statusUpdateFailed: "به‌روزرسانی وضعیت ناموفق بود",
    reportLoadFailed: "بارگذاری گزارش مالی ناموفق بود",
    settingsLoadFailed: "بارگذاری تنظیمات ناموفق بود",
    settingsUpdateFailed: "به‌روزرسانی تنظیمات ناموفق بود",
    priceToggleFailed: "تغییر وضعیت قیمت ناموفق بود",
    categoryCreateFailed: "ایجاد دسته ناموفق بود",
    categoryUpdateFailed: "ویرایش دسته ناموفق بود",
    categoryDeleteFailed: "حذف دسته ناموفق بود",
    brandCreateFailed: "ایجاد برند ناموفق بود",
    brandUpdateFailed: "به‌روزرسانی برند ناموفق بود",
    brandDeleteFailed: "حذف برند ناموفق بود",
    brandsLoadFailed: "بارگذاری برندها ناموفق بود",
    heroUpdateFailed: "ذخیره بنر ناموفق بود",
    addressesLoadFailed: "بارگذاری آدرس‌ها ناموفق بود",
    addressSaveFailed: "ثبت آدرس ناموفق بود",
    aiImageFailed: "ویرایش تصویر با AI ناموفق بود",
    aiDescriptionFailed: "تولید توضیحات ناموفق بود",
    storeLoadFailed: "بارگذاری فروشگاه ناموفق بود",
    coverageSaveFailed: "ذخیره محدوده پوشش ناموفق بود",
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
      categories: "دسته‌بندی‌ها",
      brands: "برندها",
      banners: "بنر صفحه اصلی",
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
      usernameHint: "مثال: admin یا admin@{domain}",
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
      categoriesCard: "دسته‌بندی‌ها",
      categoriesDesc: "افزودن و ویرایش دسته محصولات",
      brandsCard: "برندها",
      brandsDesc: "تعریف و مدیریت برند محصولات",
      bannersCard: "بنر صفحه اصلی",
      bannersDesc: "متن و تصویر بنر Hero",
    },
    products: {
      title: "مدیریت محصولات",
      subtitle: "افزودن محصول، بارگذاری تصویر و کنترل موجودی",
      newProduct: "محصول جدید",
      editProduct: "ویرایش محصول",
      namePlaceholder: "نام محصول",
      slugPlaceholder: "slug-en",
      descriptionPlaceholder: "توضیحات",
      descriptionSection: "توضیحات محصول (سه زبان)",
      descriptionFa: "فارسی",
      descriptionAr: "عربی",
      descriptionEn: "انگلیسی",
      aiDescriptionAll: "تولید توضیحات با AI",
      priceLabel: "قیمت (تومان)",
      stockLabel: "موجودی",
      noCategory: "بدون دسته",
      brandLabel: "برند",
      noBrand: "بدون برند",
      featuresSection: "ویژگی‌های محصول",
      featureLabelPlaceholder: "نام ویژگی (مثلاً وزن)",
      featureValuePlaceholder: "مقدار (مثلاً ۱ کیلوگرم)",
      addFeature: "افزودن ویژگی",
      removeFeature: "حذف",
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
      aiStubDescription: "{name} — محصول تازه و باکیفیت{category}.",
      aiStubCategorySuffix: " در دسته {category}",
    },
    brands: {
      title: "مدیریت برندها",
      subtitle: "تعریف برندهای محصولات فروشگاه",
      newBrand: "برند جدید",
      editBrand: "ویرایش برند",
      namePlaceholder: "نام برند",
      slugPlaceholder: "brand-slug",
      logoUrlPlaceholder: "URL لوگو (اختیاری)",
      sortOrderLabel: "ترتیب نمایش",
      save: "ذخیره",
      create: "ایجاد برند",
      cancel: "انصراف",
      edit: "ویرایش",
      delete: "حذف",
      loading: "در حال بارگذاری…",
      empty: "برندی ثبت نشده است.",
      validationName: "نام برند الزامی است",
      validationSlug: "اسلاگ برند الزامی است",
    },
    categories: {
      title: "دسته‌بندی محصولات",
      subtitle: "مدیریت دسته‌های فروشگاه",
      newCategory: "دسته جدید",
      editCategory: "ویرایش دسته",
      namePlaceholder: "نام دسته",
      slugPlaceholder: "slug-دسته",
      sortOrderLabel: "ترتیب نمایش",
      imageUrlPlaceholder: "آدرس تصویر دسته",
      uploadImage: "آپلود تصویر",
      removeImage: "حذف تصویر",
      save: "ذخیره",
      create: "ایجاد",
      cancel: "انصراف",
      edit: "ویرایش",
      delete: "حذف",
      loading: "بارگذاری…",
      empty: "دسته‌ای ثبت نشده است.",
      validationName: "نام دسته الزامی است",
      validationSlug: "شناسه URL الزامی است",
    },
    banners: {
      title: "بنر صفحه اصلی",
      subtitle: "متن و تصویر بخش Hero در صفحه فروشگاه",
      formTitle: "تنظیمات بنر",
      formHint: "فیلدهای خالی از متن پیش‌فرض ترجمه استفاده می‌کنند.",
      badgePlaceholder: "برچسب (مثلاً پیشنهاد ویژه)",
      titlePlaceholder: "عنوان بنر",
      subtitlePlaceholder: "زیرعنوان",
      ctaLabelPlaceholder: "متن دکمه",
      ctaHrefPlaceholder: "لینک دکمه (مثلاً /categories)",
      imageUrlPlaceholder: "آدرس تصویر بنر",
      uploadImage: "آپلود تصویر",
      removeImage: "حذف تصویر",
      save: "ذخیره بنر",
      previewTitle: "پیش‌نمایش",
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
    homeTitle: "فروشگاه آنلاین",
    homeOgDescription: "خرید آنلاین با ارسال سریع — EliMarket",
    categoryDescription: "خرید {name} — EliMarket",
    notFoundTitle: "صفحه یافت نشد",
    notFoundMessage: "صفحه‌ای که دنبال آن هستید وجود ندارد یا حذف شده است.",
    backToHome: "بازگشت به صفحه اصلی",
  },
};

const ar: Messages = {
  brand: { name: "EliMarket", nameLocal: "إلي ماركت", currency: "تومان" },
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
    heroSlide2Badge: "خصم خاص",
    heroSlide2Title: "منتجات ألبان طازجة يومياً",
    heroSlide2Subtitle: "خصم يصل إلى 25٪ على منتجات مختارة",
    heroSlide3Badge: "توصيل مجاني",
    heroSlide3Title: "للطلبات فوق الحد الأدنى",
    heroSlide3Subtitle: "توصيل سريع داخل المدينة",
    heroCarouselLabel: "بانرات المتجر",
    heroPrev: "الشريحة السابقة",
    heroNext: "الشريحة التالية",
    heroGoToSlide: "الانتقال إلى الشريحة {n}",
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
    inStock: "متوفر",
    outOfStock: "غير متوفر",
    description: "الوصف",
    noDescription: "لا يوجد وصف لهذا المنتج.",
    brand: "العلامة التجارية",
    features: "المواصفات",
    noFeatures: "لا توجد مواصفات.",
    addToCart: "أضف إلى السلة — {price}",
    addToCartSimple: "أضف إلى السلة",
    fallbackName: "منتج",
    vatIncluded: "شامل ضريبة القيمة المضافة",
    quantity: "الكمية",
    share: "مشاركة",
    wishlist: "المفضلة",
  },
  cart: {
    title: "سلة التسوق",
    titleWithCount: "سلة التسوق ({count})",
    empty: "سلة التسوق فارغة",
    backToStore: "العودة إلى المتجر",
    clear: "إفراغ",
    freeDeliveryProgress: "{amount} حتى {highlight}",
    freeDeliveryUnlocked: "تم تفعيل التوصيل المجاني",
    freeDeliveryHighlight: "توصيل مجاني",
    subtotal: "المجموع الفرعي",
    deliveryFee: "رسوم التوصيل",
    free: "مجاني",
    vat: "الضريبة ({percent}٪)",
    total: "الإجمالي",
    continueCheckout: "الدفع",
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
    hintSuffix: "للبدء",
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
    language: "اللغة",
  },
  notifications: {
    successTitle: "نجاح",
    errorTitle: "خطأ",
    infoTitle: "معلومات",
    warningTitle: "تحذير",
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
    categoryUpdated: "تم تحديث الفئة",
    categoryCreated: "تم إنشاء الفئة",
    categoryDeleted: "تم حذف الفئة",
    brandCreated: "تم إنشاء العلامة",
    brandUpdated: "تم تحديث العلامة",
    brandDeleted: "تم حذف العلامة",
    heroUpdated: "تم حفظ البانر",
  },
  errors: {
    operationFailed: "فشلت العملية",
    unexpectedError: "خطأ غير متوقع",
    done: "تم",
    warning: "تحذير",
    otpSendFailed: "فشل إرسال رمز التحقق",
    loginFailed: "فشل تسجيل الدخول",
    invalidOtp: "رمز التحقق غير صالح",
    adminForbidden: "هذا الحساب لا يملك صلاحية الإدارة",
    invalidCredentials: "اسم المستخدم أو كلمة المرور غير صحيحة",
    signOutFailed: "فشل تسجيل الخروج",
    productsLoadFailed: "فشل تحميل المنتجات",
    categoriesLoadFailed: "فشل تحميل الفئات",
    productNotFound: "المنتج غير موجود",
    adminProductsLoadFailed: "فشل تحميل منتجات لوحة الإدارة",
    productCreateFailed: "فشل إنشاء المنتج",
    productUpdateFailed: "فشل تحديث المنتج",
    productDeleteFailed: "فشل حذف المنتج",
    noFileSelected: "لم يتم اختيار ملف",
    imageUploadFailed: "فشل رفع الصورة",
    fileTooLarge: "حجم الصورة يتجاوز 15 ميغابايت",
    ordersLoadFailed: "فشل تحميل الطلبات",
    orderNotFound: "الطلب غير موجود",
    accessDenied: "غير مسموح بالوصول",
    cartDisabled: "تقديم الطلبات معطّل أثناء إخفاء الأسعار",
    emptyCart: "سلة التسوق فارغة",
    invalidProduct: "منتج غير صالح",
    insufficientStock: "المخزون غير كافٍ",
    orderCreateFailed: "فشل تسجيل الطلب",
    riderAssignFailed: "فشل تعيين السائق",
    ridersLoadFailed: "فشل تحميل السائقين",
    statusUpdateFailed: "فشل تحديث الحالة",
    reportLoadFailed: "فشل تحميل التقرير المالي",
    settingsLoadFailed: "فشل تحميل الإعدادات",
    settingsUpdateFailed: "فشل تحديث الإعدادات",
    priceToggleFailed: "فشل تغيير حالة الأسعار",
    categoryCreateFailed: "فشل إنشاء الفئة",
    categoryUpdateFailed: "فشل تحديث الفئة",
    categoryDeleteFailed: "فشل حذف الفئة",
    brandCreateFailed: "فشل إنشاء العلامة",
    brandUpdateFailed: "فشل تحديث العلامة",
    brandDeleteFailed: "فشل حذف العلامة",
    brandsLoadFailed: "فشل تحميل العلامات",
    heroUpdateFailed: "فشل حفظ البانر",
    addressesLoadFailed: "فشل تحميل العناوين",
    addressSaveFailed: "فشل حفظ العنوان",
    aiImageFailed: "فشل تعديل الصورة بالذكاء الاصطناعي",
    aiDescriptionFailed: "فشل إنشاء الوصف",
    storeLoadFailed: "فشل تحميل المتجر",
    coverageSaveFailed: "فشل حفظ نطاق التغطية",
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
      categories: "الفئات",
      brands: "العلامات التجارية",
      banners: "بانر الصفحة الرئيسية",
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
      usernameHint: "مثال: admin أو admin@{domain}",
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
      categoriesCard: "الفئات",
      categoriesDesc: "إضافة وتعديل فئات المنتجات",
      brandsCard: "العلامات التجارية",
      brandsDesc: "تعريف وإدارة علامات المنتجات",
      bannersCard: "بانر الصفحة الرئيسية",
      bannersDesc: "نص وصورة بانر Hero",
    },
    products: {
      title: "إدارة المنتجات",
      subtitle: "إضافة منتج، رفع صورة والتحكم بالمخزون",
      newProduct: "منتج جديد",
      editProduct: "تعديل المنتج",
      namePlaceholder: "اسم المنتج",
      slugPlaceholder: "slug-en",
      descriptionPlaceholder: "الوصف",
      descriptionSection: "وصف المنتج (ثلاث لغات)",
      descriptionFa: "فارسی",
      descriptionAr: "العربية",
      descriptionEn: "English",
      aiDescriptionAll: "إنشاء الوصف بالذكاء الاصطناعي",
      priceLabel: "السعر (تومان)",
      stockLabel: "المخزون",
      noCategory: "بدون فئة",
      brandLabel: "العلامة التجارية",
      noBrand: "بدون علامة",
      featuresSection: "مواصفات المنتج",
      featureLabelPlaceholder: "اسم المواصفة (مثل الوزن)",
      featureValuePlaceholder: "القيمة (مثل 1 كجم)",
      addFeature: "إضافة مواصفة",
      removeFeature: "حذف",
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
      validationSlug: "الرابط التعريفي مطلوب",
      aiStubDescription: "{name} — منتج طازج وعالي الجودة{category}.",
      aiStubCategorySuffix: " في فئة {category}",
    },
    brands: {
      title: "إدارة العلامات التجارية",
      subtitle: "تعريف علامات منتجات المتجر",
      newBrand: "علامة جديدة",
      editBrand: "تعديل العلامة",
      namePlaceholder: "اسم العلامة",
      slugPlaceholder: "brand-slug",
      logoUrlPlaceholder: "رابط الشعار (اختياري)",
      sortOrderLabel: "ترتيب العرض",
      save: "حفظ",
      create: "إنشاء علامة",
      cancel: "إلغاء",
      edit: "تعديل",
      delete: "حذف",
      loading: "جاري التحميل…",
      empty: "لا توجد علامات مسجلة.",
      validationName: "اسم العلامة مطلوب",
      validationSlug: "الرابط التعريفي مطلوب",
    },
    categories: {
      title: "فئات المنتجات",
      subtitle: "إدارة فئات المتجر",
      newCategory: "فئة جديدة",
      editCategory: "تعديل الفئة",
      namePlaceholder: "اسم الفئة",
      slugPlaceholder: "slug-الفئة",
      sortOrderLabel: "ترتيب العرض",
      imageUrlPlaceholder: "رابط صورة الفئة",
      uploadImage: "رفع صورة",
      removeImage: "إزالة الصورة",
      save: "حفظ",
      create: "إنشاء",
      cancel: "إلغاء",
      edit: "تعديل",
      delete: "حذف",
      loading: "جاري التحميل…",
      empty: "لا توجد فئات.",
      validationName: "اسم الفئة مطلوب",
      validationSlug: "الرابط التعريفي مطلوب",
    },
    banners: {
      title: "بانر الصفحة الرئيسية",
      subtitle: "نص وصورة قسم Hero في المتجر",
      formTitle: "إعدادات البانر",
      formHint: "الحقول الفارغة تستخدم النص الافتراضي من الترجمة.",
      badgePlaceholder: "الشارة (مثلاً عرض خاص)",
      titlePlaceholder: "عنوان البانر",
      subtitlePlaceholder: "العنوان الفرعي",
      ctaLabelPlaceholder: "نص الزر",
      ctaHrefPlaceholder: "رابط الزر (مثلاً /categories)",
      imageUrlPlaceholder: "رابط صورة البانر",
      uploadImage: "رفع صورة",
      removeImage: "إزالة الصورة",
      save: "حفظ البانر",
      previewTitle: "معاينة",
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
    siteDescription: "تسوق إلكتروني — إلي ماركت",
    storefrontTitle: "المتجر",
    productFallback: "منتج",
    homeTitle: "متجر إلكتروني",
    homeOgDescription: "تسوق إلكتروني مع توصيل سريع — إلي ماركت",
    categoryDescription: "تسوق {name} — إلي ماركت",
    notFoundTitle: "الصفحة غير موجودة",
    notFoundMessage: "الصفحة التي تبحث عنها غير موجودة أو تمت إزالتها.",
    backToHome: "العودة إلى الصفحة الرئيسية",
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
    heroSlide2Badge: "Special savings",
    heroSlide2Title: "Fresh dairy every day",
    heroSlide2Subtitle: "Up to 25% off selected items",
    heroSlide3Badge: "Free delivery",
    heroSlide3Title: "On orders above the threshold",
    heroSlide3Subtitle: "Fast delivery in your area",
    heroCarouselLabel: "Store banners",
    heroPrev: "Previous slide",
    heroNext: "Next slide",
    heroGoToSlide: "Go to slide {n}",
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
    inStock: "In stock",
    outOfStock: "Out of stock",
    description: "Description",
    noDescription: "No description available for this product.",
    brand: "Brand",
    features: "Specifications",
    noFeatures: "No specifications listed.",
    addToCart: "Add to cart — {price}",
    addToCartSimple: "Add to cart",
    fallbackName: "Product",
    vatIncluded: "Inclusive of VAT",
    quantity: "Quantity",
    share: "Share",
    wishlist: "Wishlist",
  },
  cart: {
    title: "My cart",
    titleWithCount: "My Cart ({count})",
    empty: "Your cart is empty",
    backToStore: "Back to store",
    clear: "Clear",
    freeDeliveryProgress: "You're {amount} away from {highlight}",
    freeDeliveryUnlocked: "You've unlocked FREE delivery",
    freeDeliveryHighlight: "FREE delivery",
    subtotal: "Subtotal",
    deliveryFee: "Delivery fee",
    free: "Free",
    vat: "VAT ({percent}%)",
    total: "Total",
    continueCheckout: "Checkout",
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
    language: "Language",
  },
  notifications: {
    successTitle: "Success",
    errorTitle: "Error",
    infoTitle: "Info",
    warningTitle: "Warning",
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
    categoryUpdated: "Category updated",
    categoryCreated: "Category created",
    categoryDeleted: "Category deleted",
    brandCreated: "Brand created",
    brandUpdated: "Brand updated",
    brandDeleted: "Brand deleted",
    heroUpdated: "Banner saved",
  },
  errors: {
    operationFailed: "Operation failed",
    unexpectedError: "Unexpected error",
    done: "Done",
    warning: "Warning",
    otpSendFailed: "Failed to send verification code",
    loginFailed: "Sign-in failed",
    invalidOtp: "Invalid verification code",
    adminForbidden: "This account does not have admin access",
    invalidCredentials: "Invalid username or password",
    signOutFailed: "Sign-out failed",
    productsLoadFailed: "Failed to load products",
    categoriesLoadFailed: "Failed to load categories",
    productNotFound: "Product not found",
    adminProductsLoadFailed: "Failed to load admin products",
    productCreateFailed: "Failed to create product",
    productUpdateFailed: "Failed to update product",
    productDeleteFailed: "Failed to delete product",
    noFileSelected: "No file selected",
    imageUploadFailed: "Image upload failed",
    fileTooLarge: "Image exceeds the 15 MB limit",
    ordersLoadFailed: "Failed to load orders",
    orderNotFound: "Order not found",
    accessDenied: "Access denied",
    cartDisabled: "Ordering is disabled while prices are hidden",
    emptyCart: "Cart is empty",
    invalidProduct: "Invalid product",
    insufficientStock: "Insufficient stock",
    orderCreateFailed: "Failed to place order",
    riderAssignFailed: "Failed to assign rider",
    ridersLoadFailed: "Failed to load riders",
    statusUpdateFailed: "Failed to update status",
    reportLoadFailed: "Failed to load financial report",
    settingsLoadFailed: "Failed to load settings",
    settingsUpdateFailed: "Failed to update settings",
    priceToggleFailed: "Failed to toggle price display",
    categoryCreateFailed: "Failed to create category",
    categoryUpdateFailed: "Failed to update category",
    categoryDeleteFailed: "Failed to delete category",
    brandCreateFailed: "Failed to create brand",
    brandUpdateFailed: "Failed to update brand",
    brandDeleteFailed: "Failed to delete brand",
    brandsLoadFailed: "Failed to load brands",
    heroUpdateFailed: "Failed to save banner",
    addressesLoadFailed: "Failed to load addresses",
    addressSaveFailed: "Failed to save address",
    aiImageFailed: "AI image edit failed",
    aiDescriptionFailed: "Failed to generate description",
    storeLoadFailed: "Failed to load store",
    coverageSaveFailed: "Failed to save coverage area",
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
      categories: "Categories",
      brands: "Brands",
      banners: "Homepage banner",
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
      usernameHint: "e.g. admin or admin@{domain}",
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
      categoriesCard: "Categories",
      categoriesDesc: "Add and edit product categories",
      brandsCard: "Brands",
      brandsDesc: "Define and manage product brands",
      bannersCard: "Homepage banner",
      bannersDesc: "Hero section text and image",
    },
    products: {
      title: "Product management",
      subtitle: "Add products, upload images, control stock",
      newProduct: "New product",
      editProduct: "Edit product",
      namePlaceholder: "Product name",
      slugPlaceholder: "slug-en",
      descriptionPlaceholder: "Description",
      descriptionSection: "Product description (3 languages)",
      descriptionFa: "Persian",
      descriptionAr: "Arabic",
      descriptionEn: "English",
      aiDescriptionAll: "Generate descriptions with AI",
      priceLabel: "Price (Toman)",
      stockLabel: "Stock",
      noCategory: "No category",
      brandLabel: "Brand",
      noBrand: "No brand",
      featuresSection: "Product specifications",
      featureLabelPlaceholder: "Spec name (e.g. Weight)",
      featureValuePlaceholder: "Value (e.g. 1 kg)",
      addFeature: "Add specification",
      removeFeature: "Remove",
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
      aiStubDescription: "{name} — fresh, high-quality product{category}.",
      aiStubCategorySuffix: " in {category} category",
    },
    brands: {
      title: "Brand management",
      subtitle: "Define store product brands",
      newBrand: "New brand",
      editBrand: "Edit brand",
      namePlaceholder: "Brand name",
      slugPlaceholder: "brand-slug",
      logoUrlPlaceholder: "Logo URL (optional)",
      sortOrderLabel: "Sort order",
      save: "Save",
      create: "Create brand",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      loading: "Loading…",
      empty: "No brands yet.",
      validationName: "Brand name is required",
      validationSlug: "Brand slug is required",
    },
    categories: {
      title: "Product categories",
      subtitle: "Manage store categories",
      newCategory: "New category",
      editCategory: "Edit category",
      namePlaceholder: "Category name",
      slugPlaceholder: "category-slug",
      sortOrderLabel: "Sort order",
      imageUrlPlaceholder: "Category image URL",
      uploadImage: "Upload image",
      removeImage: "Remove image",
      save: "Save",
      create: "Create",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      loading: "Loading…",
      empty: "No categories yet.",
      validationName: "Category name is required",
      validationSlug: "Slug is required",
    },
    banners: {
      title: "Homepage banner",
      subtitle: "Hero section text and image on the storefront",
      formTitle: "Banner settings",
      formHint: "Empty fields fall back to default translated copy.",
      badgePlaceholder: "Badge (e.g. Special offer)",
      titlePlaceholder: "Banner title",
      subtitlePlaceholder: "Subtitle",
      ctaLabelPlaceholder: "Button label",
      ctaHrefPlaceholder: "Button link (e.g. /categories)",
      imageUrlPlaceholder: "Banner image URL",
      uploadImage: "Upload image",
      removeImage: "Remove image",
      save: "Save banner",
      previewTitle: "Preview",
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
    homeTitle: "Online Store",
    homeOgDescription: "Online shopping with fast delivery — EliMarket",
    categoryDescription: "Shop {name} — EliMarket",
    notFoundTitle: "Page not found",
    notFoundMessage: "The page you are looking for does not exist or has been removed.",
    backToHome: "Back to homepage",
  },
};

export const messages: Record<Locale, Messages> = { fa, ar, en };

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? messages.fa;
}
