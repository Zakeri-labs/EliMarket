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
    trackOrder: string;
    help: string;
    accountSignIn: string;
    signIn: string;
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
    campaignPercentOff: string;
    campaignFixedOff: string;
    flashDeals: string;
    flashEnds: string;
    flashEndsIn: string;
    categoriesTitle: string;
    viewAll: string;
    allProducts: string;
    loadingProducts: string;
    noProducts: string;
    fallbackProduce: string;
    fallbackDairy: string;
    fallbackMeat: string;
    fallbackBakery: string;
    searchPlaceholderDesktop: string;
    utilityFreeDelivery: string;
    shopByCategory: string;
    refine: string;
    inStockOnly: string;
    onCampaign: string;
    organic: string;
    sameDayDelivery: string;
    sameDayDeliveryTitle: string;
    sameDayDeliveryBody: string;
    heroFreshThisWeek: string;
    filterLabel: string;
    pillCampaigns: string;
    pillNewest: string;
    pillBestSellers: string;
    pillDiscounted: string;
    pillUnderOne: string;
    pillLocal: string;
    browseDeals: string;
    heroDesktopTitle: string;
    heroDesktopSubtitle: string;
    allCategories: string;
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
    addShort: string;
    fallbackName: string;
    vatIncluded: string;
    quantity: string;
    unitCount: string;
    unitWeight: string;
    unitPack: string;
    share: string;
    wishlist: string;
    zoom: string;
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
    saveAddress: string;
    editAddress: string;
    deleteAddress: string;
    pickOnMap: string;
    outsideCoverage: string;
    coverageOk: string;
    paymentRedirecting: string;
    payNow: string;
    paymentPending: string;
    paymentFailed: string;
    paymentSuccess: string;
    sandboxPay: string;
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
    allCategories: string;
    allCampaigns: string;
    minPrice: string;
    maxPrice: string;
    onSale: string;
    sortNewest: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    filters: string;
    clearFilters: string;
    resultsCount: string;
    sortLabel: string;
    categoryLabel: string;
    campaignLabel: string;
    priceLabel: string;
  };
  pwa: {
    install: string;
    installTitle: string;
    installDesc: string;
    dismiss: string;
  };
  categories: {
    title: string;
    searchInCategories: string;
    back: string;
    subcategoryCount: string;
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
    saving: string;
    processing: string;
    uploading: string;
    back: string;
    free: string;
    error: string;
    language: string;
    themeLight: string;
    themeDark: string;
    cancel: string;
    delete: string;
    confirmDeleteTitle: string;
    confirmDelete: string;
  };
  notifications: {
    successTitle: string;
    errorTitle: string;
    infoTitle: string;
    warningTitle: string;
    otpSent: string;
    loginSuccess: string;
    addressSaved: string;
    addressUpdated: string;
    addressDeleted: string;
    orderPlaced: string;
    addedToCart: string;
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
    bannerCreated: string;
    bannerUpdated: string;
    bannerDeleted: string;
    campaignCreated: string;
    campaignUpdated: string;
    campaignDeleted: string;
    smartProductReady: string;
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
    bannersLoadFailed: string;
    bannerCreateFailed: string;
    bannerUpdateFailed: string;
    bannerDeleteFailed: string;
    campaignsLoadFailed: string;
    campaignCreateFailed: string;
    campaignUpdateFailed: string;
    campaignDeleteFailed: string;
    campaignNameRequired: string;
    campaignDatesRequired: string;
    campaignWindowInvalid: string;
    campaignDiscountRequired: string;
    campaignPercentMax: string;
    campaignProductsRequired: string;
    addressesLoadFailed: string;
    addressSaveFailed: string;
    addressUpdateFailed: string;
    addressDeleteFailed: string;
    outsideCoverage: string;
    coverageCheckFailed: string;
    paymentNotFound: string;
    paymentVerifyFailed: string;
    customersLoadFailed: string;
    categoryParentInvalid: string;
    aiImageFailed: string;
    aiDescriptionFailed: string;
    smartProductFailed: string;
    smartProductNoImages: string;
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
      campaigns: string;
      orders: string;
      reports: string;
      coverage: string;
      customers: string;
      smartProduct: string;
    };
    navGroups: {
      overview: string;
      catalog: string;
      marketing: string;
      operations: string;
      insights: string;
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
      subtitle: string;
      salesToday: string;
      salesWeek: string;
      salesMonth: string;
      activeOrders: string;
      liveCampaigns: string;
      inventory: string;
      activeProducts: string;
      outOfStock: string;
      lowStockTitle: string;
      topSellers: string;
      topSellersEmpty: string;
      soldCount: string;
      viewReports: string;
      viewOrders: string;
      viewProducts: string;
      salesTrend: string;
      chartRevenue: string;
      chartOrders: string;
      inventorySplit: string;
      stockOk: string;
      orderStatusChart: string;
      productsCard: string;
      productsDesc: string;
      ordersCard: string;
      ordersDesc: string;
      reportsCard: string;
      reportsDesc: string;
      customersCard: string;
      customersDesc: string;
      coverageCard: string;
      coverageDesc: string;
      categoriesCard: string;
      categoriesDesc: string;
      brandsCard: string;
      brandsDesc: string;
      bannersCard: string;
      bannersDesc: string;
      campaignsCard: string;
      campaignsDesc: string;
      smartProductCard: string;
      smartProductDesc: string;
      warehouseBadge: string;
      warehouseTitle: string;
      warehouseProducts: string;
      warehouseCategories: string;
      warehouseUnits: string;
      warehouseAutoStock: string;
      warehouseAlerts: string;
      warehouseOrders: string;
    };
    products: {
      title: string;
      subtitle: string;
      newProduct: string;
      smartRegister: string;
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
      compareAtPriceLabel: string;
      pricePlaceholder: string;
      stockLabel: string;
      inventoryUnit: string;
      unitCount: string;
      unitWeight: string;
      unitPack: string;
      lowStockThreshold: string;
      lowStock: string;
      noCategory: string;
      brandLabel: string;
      noBrand: string;
      featuresSection: string;
      featureLabelPlaceholder: string;
      featureValuePlaceholder: string;
      addFeature: string;
      removeFeature: string;
      imageUrlPlaceholder: string;
      imagesSection: string;
      imagesHint: string;
      uploadImages: string;
      addImageUrl: string;
      setPrimaryImage: string;
      primaryImage: string;
      removeImage: string;
      maxImages: string;
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
      saveStock: string;
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
      validationPrice: string;
      validationCompareAt: string;
      validationCompareAtMin: string;
      aiStubDescription: string;
      aiStubCategorySuffix: string;
    };
    smartProduct: {
      title: string;
      subtitle: string;
      uploadTitle: string;
      uploadHint: string;
      uploadButton: string;
      maxPhotos: string;
      removePhoto: string;
      hintName: string;
      hintNamePlaceholder: string;
      categoryOptional: string;
      processButton: string;
      processing: string;
      processingEnhance: string;
      processingContent: string;
      before: string;
      after: string;
      pickPrimary: string;
      primaryBadge: string;
      reviewTitle: string;
      reviewHint: string;
      publish: string;
      startOver: string;
      noImages: string;
      fallbackNotice: string;
      stepPhoto: string;
      stepEnhance: string;
      stepContent: string;
      stepReview: string;
      stepPublish: string;
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
      parentLabel: string;
      noParent: string;
      childBadge: string;
      nestedHint: string;
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
      create: string;
      cancel: string;
      edit: string;
      delete: string;
      previewTitle: string;
      newBanner: string;
      editBanner: string;
      empty: string;
      loading: string;
      sortOrderLabel: string;
      activeLabel: string;
      inactiveLabel: string;
    };
    campaigns: {
      title: string;
      subtitle: string;
      newCampaign: string;
      editCampaign: string;
      namePlaceholder: string;
      badgePlaceholder: string;
      bannerHint: string;
      bannerLabel: string;
      uploadImage: string;
      removeImage: string;
      typeLabel: string;
      typePercent: string;
      typeFixed: string;
      valueLabel: string;
      startsAt: string;
      endsAt: string;
      activeLabel: string;
      homeLabel: string;
      productsLabel: string;
      productSearch: string;
      noProducts: string;
      selectedCount: string;
      productCount: string;
      percentOff: string;
      fixedOff: string;
      save: string;
      create: string;
      cancel: string;
      edit: string;
      delete: string;
      loading: string;
      empty: string;
      status: {
        live: string;
        scheduled: string;
        ended: string;
        inactive: string;
      };
    };
    orders: {
      title: string;
      loading: string;
      empty: string;
      orderPrefix: string;
      riderPlaceholder: string;
      assignRider: string;
      customer: string;
      payment: string;
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
      weekly: string;
      monthly: string;
      daily: string;
    };
    customers: {
      title: string;
      subtitle: string;
      loading: string;
      empty: string;
      colName: string;
      colPhone: string;
      colOrders: string;
      colSpent: string;
      colJoined: string;
      entityName: string;
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
      confirmOffTitle: string;
      confirmOffDesc: string;
      confirmOffAction: string;
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
  brand: { name: "EliMarket", nameLocal: "EliMarket", currency: "ر.ع." },
  nav: {
    home: "خانه",
    categories: "دسته‌ها",
    search: "جستجو",
    orders: "سفارش‌ها",
    account: "حساب",
    cart: "سبد خرید",
    searchShortcut: "جستجو",
    trackOrder: "پیگیری سفارش",
    help: "راهنما",
    accountSignIn: "حساب / ورود",
    signIn: "ورود",
  },
  home: {
    deliverTo: "تحویل به",
    locationSample: "مسقط، الخوض",
    searchPlaceholder: "جستجوی محصول…",
    heroBadge: "پیشنهاد ویژه",
    heroTitle: "مواد تازه روزانه",
    heroSubtitle: "ارسال سریع تا ۲ ساعت",
    heroCta: "خرید کنید",
    heroSlide2Badge: "تخفیف ویژه",
    heroSlide2Title: "لبنیات تازه هر روز",
    heroSlide2Subtitle: "تا ۲۵٪ تخفیف روی محصولات منتخب",
    heroSlide3Badge: "ارسال رایگان",
    heroSlide3Title: "خرید بالای ۱۰ ریال عمان",
    heroSlide3Subtitle: "تحویل سریع در محدوده شهر",
    heroCarouselLabel: "بنرهای فروشگاه",
    heroPrev: "اسلاید قبلی",
    heroNext: "اسلاید بعدی",
    heroGoToSlide: "رفتن به اسلاید {n}",
    campaignPercentOff: "{value}٪ تخفیف",
    campaignFixedOff: "{value} ریال عمان تخفیف",
    flashDeals: "پیشنهاد لحظه‌ای",
    flashEnds: "پایان: ۰۲:۴۵:۱۸",
    flashEndsIn: "پایان در",
    categoriesTitle: "خرید بر اساس دسته",
    viewAll: "مشاهده همه",
    allProducts: "همه محصولات",
    loadingProducts: "در حال بارگذاری محصولات…",
    noProducts: "محصولی یافت نشد.",
    fallbackProduce: "میوه و سبزی",
    fallbackDairy: "لبنیات",
    fallbackMeat: "گوشت",
    fallbackBakery: "نانوایی",
    searchPlaceholderDesktop: "جستجوی محصول، برند و دسته…",
    utilityFreeDelivery: "ارسال رایگان برای سفارش‌های بالای {amount} · مسقط و سیب",
    shopByCategory: "خرید بر اساس دسته",
    refine: "فیلتر",
    inStockOnly: "فقط موجود",
    onCampaign: "در کمپین",
    organic: "ارگانیک",
    sameDayDelivery: "ارسال امروز — تا ساعت ۱۶ سفارش دهید، امشب بین ۲۰ تا ۲۲ تحویل بگیرید.",
    sameDayDeliveryTitle: "ارسال امروز",
    sameDayDeliveryBody: "تا ساعت ۱۶ سفارش دهید، امشب بین ۲۰ تا ۲۲ تحویل بگیرید.",
    heroFreshThisWeek: "تازه این هفته",
    filterLabel: "فیلتر",
    pillCampaigns: "کمپین‌ها",
    pillNewest: "جدیدترین",
    pillBestSellers: "پرفروش",
    pillDiscounted: "تخفیف‌دار",
    pillUnderOne: "زیر ۱ ریال",
    pillLocal: "تولید محلی",
    browseDeals: "مشاهده پیشنهادها",
    heroDesktopTitle: "تازه‌های ضروری، دم در خانه",
    heroDesktopSubtitle: "تا {highlight} تخفیف روی اقلام روزانه",
    allCategories: "همه دسته‌ها",
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
    addShort: "افزودن",
    fallbackName: "محصول",
    vatIncluded: "شامل مالیات",
    quantity: "تعداد",
    unitCount: "عدد",
    unitWeight: "کیلو",
    unitPack: "بسته",
    share: "اشتراک‌گذاری",
    wishlist: "علاقه‌مندی",
    zoom: "بزرگ‌نمایی تصویر",
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
    saveAddress: "ذخیره آدرس",
    editAddress: "ویرایش",
    deleteAddress: "حذف",
    pickOnMap: "محل را روی نقشه انتخاب کنید",
    outsideCoverage: "این آدرس خارج از محدوده ارسال است",
    coverageOk: "این آدرس داخل محدوده ارسال است",
    paymentRedirecting: "در حال انتقال به درگاه پرداخت…",
    payNow: "پرداخت سفارش",
    paymentPending: "پرداخت در انتظار تأیید است",
    paymentFailed: "پرداخت ناموفق بود",
    paymentSuccess: "پرداخت با موفقیت انجام شد",
    sandboxPay: "تأیید پرداخت آزمایشی",
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
    allCategories: "همه دسته‌ها",
    allCampaigns: "همه کمپین‌ها",
    minPrice: "حداقل قیمت",
    maxPrice: "حداکثر قیمت",
    onSale: "فقط تخفیف‌دار",
    sortNewest: "جدیدترین",
    sortPriceAsc: "ارزان‌ترین",
    sortPriceDesc: "گران‌ترین",
    filters: "فیلترها",
    clearFilters: "حذف فیلترها",
    resultsCount: "{count} محصول",
    sortLabel: "مرتب‌سازی",
    categoryLabel: "دسته‌بندی",
    campaignLabel: "کمپین",
    priceLabel: "قیمت",
  },
  pwa: {
    install: "نصب برنامه",
    installTitle: "EliMarket را نصب کنید",
    installDesc: "دسترسی سریع‌تر به فروشگاه، حتی بدون مرورگر",
    dismiss: "الان نه",
  },
  categories: {
    title: "دسته‌بندی‌ها",
    searchInCategories: "جستجو در دسته‌ها",
    back: "دسته‌ها",
    subcategoryCount: "{count} زیردسته",
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
    saving: "در حال ذخیره…",
    processing: "در حال انجام…",
    uploading: "در حال آپلود…",
    back: "بازگشت",
    free: "رایگان",
    error: "خطا",
    language: "زبان",
    themeLight: "تم روشن",
    themeDark: "تم تیره",
    cancel: "انصراف",
    delete: "حذف",
    confirmDeleteTitle: "آیا مطمئن هستید؟",
    confirmDelete: "این مورد حذف می‌شود و قابل بازگشت نیست.",
  },
  notifications: {
    successTitle: "موفق",
    errorTitle: "خطا",
    infoTitle: "اطلاعات",
    warningTitle: "هشدار",
    otpSent: "کد ارسال شد",
    loginSuccess: "ورود موفق",
    addressSaved: "آدرس ثبت شد",
    addressUpdated: "آدرس به‌روز شد",
    addressDeleted: "آدرس حذف شد",
    orderPlaced: "سفارش ثبت شد",
    addedToCart: "به سبد خرید اضافه شد",
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
    bannerCreated: "بنر ایجاد شد",
    bannerUpdated: "بنر به‌روز شد",
    bannerDeleted: "بنر حذف شد",
    campaignCreated: "کمپین ایجاد شد",
    campaignUpdated: "کمپین به‌روز شد",
    campaignDeleted: "کمپین حذف شد",
    smartProductReady: "پیش‌نویس محصول آماده شد",
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
    bannersLoadFailed: "بارگذاری بنرها ناموفق بود",
    bannerCreateFailed: "ایجاد بنر ناموفق بود",
    bannerUpdateFailed: "ویرایش بنر ناموفق بود",
    bannerDeleteFailed: "حذف بنر ناموفق بود",
    campaignsLoadFailed: "بارگذاری کمپین‌ها ناموفق بود",
    campaignCreateFailed: "ایجاد کمپین ناموفق بود",
    campaignUpdateFailed: "ویرایش کمپین ناموفق بود",
    campaignDeleteFailed: "حذف کمپین ناموفق بود",
    campaignNameRequired: "نام کمپین الزامی است",
    campaignDatesRequired: "تاریخ شروع و پایان را وارد کنید",
    campaignWindowInvalid: "تاریخ پایان باید بعد از شروع باشد",
    campaignDiscountRequired: "مقدار تخفیف نامعتبر است",
    campaignPercentMax: "تخفیف درصدی حداکثر ۹۰ است",
    campaignProductsRequired: "حداقل یک محصول را انتخاب کنید",
    addressesLoadFailed: "بارگذاری آدرس‌ها ناموفق بود",
    addressSaveFailed: "ثبت آدرس ناموفق بود",
    addressUpdateFailed: "ویرایش آدرس ناموفق بود",
    addressDeleteFailed: "حذف آدرس ناموفق بود",
    outsideCoverage: "آدرس خارج از محدوده پوشش است",
    coverageCheckFailed: "بررسی محدوده پوشش ناموفق بود",
    paymentNotFound: "پرداخت یافت نشد",
    paymentVerifyFailed: "تأیید پرداخت ناموفق بود",
    customersLoadFailed: "بارگذاری مشتریان ناموفق بود",
    categoryParentInvalid: "دسته والد نامعتبر است",
    aiImageFailed: "ویرایش تصویر با AI ناموفق بود",
    aiDescriptionFailed: "تولید توضیحات ناموفق بود",
    smartProductFailed: "ثبت هوشمند محصول ناموفق بود",
    smartProductNoImages: "هیچ تصویری برای پردازش وجود ندارد",
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
      campaigns: "تخفیف و کمپین",
      orders: "سفارش‌ها",
      reports: "گزارشات مالی",
      coverage: "محدوده پوشش",
      customers: "مشتریان",
      smartProduct: "ثبت هوشمند",
    },
    navGroups: {
      overview: "کلی",
      catalog: "کاتالوگ",
      marketing: "بازاریابی",
      operations: "عملیات",
      insights: "گزارش‌ها",
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
      subtitle: "وضعیت فروش، موجودی و سفارش‌ها در یک نگاه",
      salesToday: "فروش امروز",
      salesWeek: "فروش ۷ روز اخیر",
      salesMonth: "فروش این ماه",
      activeOrders: "سفارش‌های فعال",
      liveCampaigns: "کمپین فعال",
      inventory: "موجودی انبار",
      activeProducts: "{count} محصول فعال",
      outOfStock: "ناموجود",
      lowStockTitle: "کمتر از حد تعریف‌شده",
      topSellers: "محصولات پرفروش این ماه",
      topSellersEmpty: "این ماه هنوز سفارشی ثبت نشده است.",
      soldCount: "{count} فروش",
      viewReports: "گزارش کامل",
      viewOrders: "همه سفارش‌ها",
      viewProducts: "مدیریت موجودی",
      salesTrend: "روند فروش",
      chartRevenue: "فروش",
      chartOrders: "سفارش",
      inventorySplit: "وضعیت موجودی",
      stockOk: "موجودی کافی",
      orderStatusChart: "وضعیت سفارش‌ها",
      productsCard: "مدیریت محصولات",
      productsDesc: "افزودن، تصویر، موجودی",
      ordersCard: "مدیریت سفارش‌ها",
      ordersDesc: "وضعیت و پیک",
      reportsCard: "گزارشات مالی",
      reportsDesc: "درآمد و موجودی کم",
      customersCard: "مشتریان",
      customersDesc: "لیست و سابقه خرید",
      coverageCard: "محدوده پوشش",
      coverageDesc: "نقشه تحویل",
      categoriesCard: "دسته‌بندی‌ها",
      categoriesDesc: "افزودن و ویرایش دسته محصولات",
      brandsCard: "برندها",
      brandsDesc: "تعریف و مدیریت برند محصولات",
      bannersCard: "بنر صفحه اصلی",
      bannersDesc: "چند بنر برای اسلایدر فروشگاه",
      campaignsCard: "تخفیف و فروش ویژه",
      campaignsDesc: "کمپین‌های زمان‌دار و تخفیف روی محصولات",
      smartProductCard: "ثبت هوشمند محصول",
      smartProductDesc: "از عکس خام تا محتوای آماده فروش با AI",
      warehouseBadge: "پنل مدیریت و انبار",
      warehouseTitle: "کنترل روزانه فروشگاه",
      warehouseProducts: "مدیریت محصول، قیمت، تصاویر و وضعیت فعال/غیرفعال",
      warehouseCategories: "مدیریت دسته‌بندی‌های درختی و نامحدود",
      warehouseUnits: "ثبت موجودی عددی، وزنی و بسته‌ای",
      warehouseAutoStock: "کسر خودکار موجودی پس از سفارش",
      warehouseAlerts: "جلوگیری از فروش کالای ناموجود و هشدار کمبود موجودی",
      warehouseOrders: "مدیریت سفارش‌ها، مشتریان و وضعیت سفارش",
    },
    products: {
      title: "مدیریت محصولات",
      subtitle: "افزودن محصول، بارگذاری تصویر و کنترل موجودی",
      newProduct: "محصول جدید",
      smartRegister: "ثبت هوشمند با AI",
      editProduct: "ویرایش محصول",
      namePlaceholder: "نام محصول",
      slugPlaceholder: "slug-en",
      descriptionPlaceholder: "توضیحات",
      descriptionSection: "توضیحات محصول (سه زبان)",
      descriptionFa: "فارسی",
      descriptionAr: "عربی",
      descriptionEn: "انگلیسی",
      aiDescriptionAll: "تولید توضیحات با AI",
      priceLabel: "قیمت (ریال عمان)",
      compareAtPriceLabel: "قیمت قبل از تخفیف (ریال عمان)",
      pricePlaceholder: "مثلاً ۱,۲۵۰",
      stockLabel: "موجودی",
      inventoryUnit: "نوع موجودی",
      unitCount: "عددی",
      unitWeight: "وزنی (کیلو)",
      unitPack: "بسته‌ای",
      lowStockThreshold: "آستانه هشدار کمبود",
      lowStock: "کمبود موجودی",
      noCategory: "بدون دسته",
      brandLabel: "برند",
      noBrand: "بدون برند",
      featuresSection: "ویژگی‌های محصول",
      featureLabelPlaceholder: "نام ویژگی (مثلاً وزن)",
      featureValuePlaceholder: "مقدار (مثلاً ۱ کیلوگرم)",
      addFeature: "افزودن ویژگی",
      removeFeature: "حذف",
      imageUrlPlaceholder: "URL تصویر (یا آپلود کنید)",
      imagesSection: "تصاویر محصول",
      imagesHint: "چند زاویه از محصول آپلود کنید. تصویر اول، تصویر اصلی کارت و صفحه محصول است.",
      uploadImages: "آپلود چند تصویر",
      addImageUrl: "افزودن لینک",
      setPrimaryImage: "تصویر اصلی",
      primaryImage: "اصلی",
      removeImage: "حذف",
      maxImages: "تا {count} تصویر",
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
      saveStock: "ذخیره‌ی موجودی",
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
      validationPrice: "قیمت محصول را وارد کنید",
      validationCompareAt: "قیمت قبل از تخفیف را وارد کنید",
      validationCompareAtMin: "قیمت قبل از تخفیف باید برابر یا بیشتر از قیمت فروش باشد",
      aiStubDescription: "{name} — محصول تازه و باکیفیت{category}.",
      aiStubCategorySuffix: " در دسته {category}",
    },
    smartProduct: {
      title: "ثبت هوشمند محصول",
      subtitle: "از عکس خام تا محتوای آماده فروش با کمک AI",
      uploadTitle: "عکس محصول",
      uploadHint: "چند زاویه از بسته‌بندی یا محصول بگیرید یا آپلود کنید. AI کیفیت تصویر را بهتر می‌کند و پیش‌نویس محتوا می‌سازد.",
      uploadButton: "گرفتن یا آپلود عکس",
      maxPhotos: "تا {count} عکس",
      removePhoto: "حذف",
      hintName: "نام محصول (اختیاری)",
      hintNamePlaceholder: "اگر روی بسته‌بندی خوانا نیست، اینجا بنویسید",
      categoryOptional: "دسته‌بندی (اختیاری)",
      processButton: "بهبود تصویر و تولید محتوا",
      processing: "در حال آماده‌سازی پیش‌نویس…",
      processingEnhance: "حذف پس‌زمینه و یکدست‌کردن تصاویر",
      processingContent: "پیشنهاد نام و توضیحات سه‌زبانه",
      before: "قبل",
      after: "بعد",
      pickPrimary: "تصویر اصلی کاتالوگ را انتخاب کنید",
      primaryBadge: "تصویر اصلی",
      reviewTitle: "بازبینی ادمین",
      reviewHint: "متن و قیمت را اصلاح کنید، سپس در کاتالوگ ثبت کنید.",
      publish: "ثبت در کاتالوگ",
      startOver: "شروع دوباره",
      noImages: "حداقل یک عکس انتخاب کنید",
      fallbackNotice: "مدل بینایی پیکربندی نشده؛ پیش‌نویس را خودتان کامل کنید. برای تشخیص خودکار عکس، GEMINI_API_KEY یا OPENAI_API_KEY را تنظیم کنید.",
      stepPhoto: "عکس محصول",
      stepEnhance: "بهبود تصویر",
      stepContent: "تولید محتوا",
      stepReview: "بازبینی",
      stepPublish: "ثبت کاتالوگ",
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
      parentLabel: "دسته والد",
      noParent: "بدون والد (دسته اصلی)",
      childBadge: "زیردسته",
      nestedHint: "هر دسته می‌تواند زیرمجموعه نامحدود داشته باشد.",
    },
    banners: {
      title: "بنر صفحه اصلی",
      subtitle: "چند بنر برای اسلایدر فروشگاه",
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
      save: "ذخیره",
      create: "ایجاد",
      cancel: "انصراف",
      edit: "ویرایش",
      delete: "حذف",
      previewTitle: "پیش‌نمایش",
      newBanner: "بنر جدید",
      editBanner: "ویرایش بنر",
      empty: "بنری ثبت نشده است.",
      loading: "بارگذاری…",
      sortOrderLabel: "ترتیب نمایش",
      activeLabel: "نمایش در فروشگاه",
      inactiveLabel: "غیرفعال",
    },
    campaigns: {
      title: "تخفیف و کمپین",
      subtitle: "فروش ویژه و کمپین‌های زمان‌دار روی محصولات منتخب",
      newCampaign: "کمپین جدید",
      editCampaign: "ویرایش کمپین",
      namePlaceholder: "نام کمپین (مثلاً جمعه ویژه)",
      badgePlaceholder: "برچسب روی کارت (مثلاً فروش ویژه)",
      bannerHint: "این تصویر فقط وقتی کمپین فعال و در بازه زمانی باشد در بنرهای صفحه اصلی نمایش داده می‌شود.",
      bannerLabel: "تصویر بنر صفحه اصلی",
      uploadImage: "آپلود تصویر بنر",
      removeImage: "حذف تصویر بنر",
      typeLabel: "نوع تخفیف",
      typePercent: "درصدی",
      typeFixed: "مبلغ ثابت",
      valueLabel: "مقدار تخفیف",
      startsAt: "شروع",
      endsAt: "پایان",
      activeLabel: "فعال",
      homeLabel: "نمایش در پیشنهاد لحظه‌ای صفحه اصلی",
      productsLabel: "محصولات مشمول",
      productSearch: "جستجوی محصول",
      noProducts: "محصولی یافت نشد.",
      selectedCount: "{count} محصول انتخاب شده",
      productCount: "{count} محصول",
      percentOff: "{value}٪ تخفیف",
      fixedOff: "{value} ریال عمان تخفیف",
      save: "ذخیره",
      create: "ایجاد",
      cancel: "انصراف",
      edit: "ویرایش",
      delete: "حذف",
      loading: "بارگذاری…",
      empty: "کمپینی ثبت نشده است.",
      status: {
        live: "در حال اجرا",
        scheduled: "زمان‌بندی‌شده",
        ended: "پایان‌یافته",
        inactive: "غیرفعال",
      },
    },
    orders: {
      title: "سفارش‌ها",
      loading: "بارگذاری…",
      empty: "سفارشی یافت نشد.",
      orderPrefix: "سفارش",
      riderPlaceholder: "UUID پیک",
      assignRider: "تخصیص پیک",
      customer: "مشتری",
      payment: "پرداخت",
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
      weekly: "هفتگی",
      monthly: "ماهانه",
      daily: "روزانه",
    },
    customers: {
      title: "مشتریان",
      subtitle: "لیست مشتریان و سابقه خرید",
      loading: "بارگذاری مشتریان…",
      empty: "مشتری‌ای ثبت نشده است.",
      colName: "نام",
      colPhone: "تلفن",
      colOrders: "سفارش‌ها",
      colSpent: "خرید",
      colJoined: "عضویت",
      entityName: "مشتریان",
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
      confirmOffTitle: "قیمت‌ها در کل فروشگاه مخفی بشه؟",
      confirmOffDesc: "با این کار قیمت محصولات برای همه‌ی مشتریان مخفی و سبد خرید غیرفعال می‌شود.",
      confirmOffAction: "بله، مخفی کن",
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
  brand: { name: "EliMarket", nameLocal: "إلي ماركت", currency: "ر.ع." },
  nav: {
    home: "الرئيسية",
    categories: "الفئات",
    search: "بحث",
    orders: "الطلبات",
    account: "الحساب",
    cart: "سلة التسوق",
    searchShortcut: "بحث",
    trackOrder: "تتبع الطلب",
    help: "مساعدة",
    accountSignIn: "الحساب / تسجيل الدخول",
    signIn: "تسجيل الدخول",
  },
  home: {
    deliverTo: "التوصيل إلى",
    locationSample: "مسقط، الخوض",
    searchPlaceholder: "البحث عن منتج…",
    heroBadge: "عرض خاص",
    heroTitle: "مواد طازجة يومياً",
    heroSubtitle: "توصيل سريع خلال ساعتين",
    heroCta: "تسوق الآن",
    heroSlide2Badge: "خصم خاص",
    heroSlide2Title: "منتجات ألبان طازجة يومياً",
    heroSlide2Subtitle: "خصم يصل إلى 25٪ على منتجات مختارة",
    heroSlide3Badge: "توصيل مجاني",
    heroSlide3Title: "للطلبات فوق ١٠ ريالات عمانية",
    heroSlide3Subtitle: "توصيل سريع داخل المدينة",
    heroCarouselLabel: "بانرات المتجر",
    heroPrev: "الشريحة السابقة",
    heroNext: "الشريحة التالية",
    heroGoToSlide: "الانتقال إلى الشريحة {n}",
    campaignPercentOff: "خصم {value}٪",
    campaignFixedOff: "خصم {value} ر.ع.",
    flashDeals: "عروض لحظية",
    flashEnds: "ينتهي: ٠٢:٤٥:١٨",
    flashEndsIn: "ينتهي خلال",
    categoriesTitle: "تسوق حسب الفئة",
    viewAll: "عرض الكل",
    allProducts: "جميع المنتجات",
    loadingProducts: "جاري تحميل المنتجات…",
    noProducts: "لم يتم العثور على منتجات.",
    fallbackProduce: "فواكه وخضروات",
    fallbackDairy: "ألبان",
    fallbackMeat: "لحوم",
    fallbackBakery: "مخبوزات",
    searchPlaceholderDesktop: "ابحث عن منتجات وعلامات وفئات…",
    utilityFreeDelivery: "توصيل مجاني للطلبات فوق {amount} · مسقط والسيب",
    shopByCategory: "تسوق حسب الفئة",
    refine: "تصفية",
    inStockOnly: "المتوفّر فقط",
    onCampaign: "ضمن حملة",
    organic: "عضوي",
    sameDayDelivery: "توصيل اليوم — اطلب قبل الساعة ٤ مساءً واستلمه الليلة بين ٨ و١٠.",
    sameDayDeliveryTitle: "توصيل في نفس اليوم",
    sameDayDeliveryBody: "اطلب قبل الساعة ٤ مساءً، واستلمه الليلة بين ٨ و١٠.",
    heroFreshThisWeek: "طازج هذا الأسبوع",
    filterLabel: "تصفية",
    pillCampaigns: "الحملات",
    pillNewest: "الأحدث",
    pillBestSellers: "الأكثر مبيعاً",
    pillDiscounted: "مخفّضة",
    pillUnderOne: "أقل من ريال واحد",
    pillLocal: "منتج محلي",
    browseDeals: "تصفح العروض",
    heroDesktopTitle: "أساسيات طازجة، تصلك إلى بابك",
    heroDesktopSubtitle: "وفّر حتى {highlight} على المستلزمات اليومية",
    allCategories: "كل الفئات",
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
    addShort: "أضف",
    fallbackName: "منتج",
    vatIncluded: "شامل ضريبة القيمة المضافة",
    quantity: "الكمية",
    unitCount: "قطعة",
    unitWeight: "كيلو",
    unitPack: "علبة",
    share: "مشاركة",
    wishlist: "المفضلة",
    zoom: "تكبير الصورة",
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
    saveAddress: "حفظ العنوان",
    editAddress: "تعديل",
    deleteAddress: "حذف",
    pickOnMap: "حدد الموقع على الخريطة",
    outsideCoverage: "هذا العنوان خارج نطاق التوصيل",
    coverageOk: "هذا العنوان داخل نطاق التوصيل",
    paymentRedirecting: "جارٍ التحويل إلى بوابة الدفع…",
    payNow: "دفع الطلب",
    paymentPending: "الدفع بانتظار التأكيد",
    paymentFailed: "فشل الدفع",
    paymentSuccess: "تم الدفع بنجاح",
    sandboxPay: "تأكيد الدفع التجريبي",
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
    allCategories: "كل الفئات",
    allCampaigns: "كل الحملات",
    minPrice: "أدنى سعر",
    maxPrice: "أعلى سعر",
    onSale: "العروض فقط",
    sortNewest: "الأحدث",
    sortPriceAsc: "الأرخص",
    sortPriceDesc: "الأغلى",
    filters: "عوامل التصفية",
    clearFilters: "مسح التصفية",
    resultsCount: "{count} منتج",
    sortLabel: "الترتيب",
    categoryLabel: "الفئة",
    campaignLabel: "الحملة",
    priceLabel: "السعر",
  },
  pwa: {
    install: "تثبيت التطبيق",
    installTitle: "ثبّت إلي ماركت",
    installDesc: "وصول أسرع إلى المتجر حتى بدون المتصفح",
    dismiss: "لاحقاً",
  },
  categories: {
    title: "الفئات",
    searchInCategories: "بحث في الفئات",
    back: "الفئات",
    subcategoryCount: "{count} فئات فرعية",
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
    saving: "جاري الحفظ…",
    processing: "جاري التنفيذ…",
    uploading: "جاري الرفع…",
    back: "رجوع",
    free: "مجاني",
    error: "خطأ",
    language: "اللغة",
    themeLight: "المظهر الفاتح",
    themeDark: "المظهر الداكن",
    cancel: "إلغاء",
    delete: "حذف",
    confirmDeleteTitle: "هل أنت متأكد؟",
    confirmDelete: "سيتم حذف هذا العنصر ولا يمكن التراجع عن ذلك.",
  },
  notifications: {
    successTitle: "نجاح",
    errorTitle: "خطأ",
    infoTitle: "معلومات",
    warningTitle: "تحذير",
    otpSent: "تم إرسال الرمز",
    loginSuccess: "تم تسجيل الدخول",
    addressSaved: "تم حفظ العنوان",
    addressUpdated: "تم تحديث العنوان",
    addressDeleted: "تم حذف العنوان",
    orderPlaced: "تم تسجيل الطلب",
    addedToCart: "تمت الإضافة إلى سلة التسوق",
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
    bannerCreated: "تم إنشاء البانر",
    bannerUpdated: "تم تحديث البانر",
    bannerDeleted: "تم حذف البانر",
    campaignCreated: "تم إنشاء الحملة",
    campaignUpdated: "تم تحديث الحملة",
    campaignDeleted: "تم حذف الحملة",
    smartProductReady: "أصبحت مسودة المنتج جاهزة",
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
    bannersLoadFailed: "فشل تحميل البانرات",
    bannerCreateFailed: "فشل إنشاء البانر",
    bannerUpdateFailed: "فشل تحديث البانر",
    bannerDeleteFailed: "فشل حذف البانر",
    campaignsLoadFailed: "فشل تحميل الحملات",
    campaignCreateFailed: "فشل إنشاء الحملة",
    campaignUpdateFailed: "فشل تحديث الحملة",
    campaignDeleteFailed: "فشل حذف الحملة",
    campaignNameRequired: "اسم الحملة مطلوب",
    campaignDatesRequired: "أدخل تاريخ البداية والنهاية",
    campaignWindowInvalid: "يجب أن يكون تاريخ النهاية بعد البداية",
    campaignDiscountRequired: "قيمة الخصم غير صالحة",
    campaignPercentMax: "الخصم بالنسبة لا يتجاوز 90٪",
    campaignProductsRequired: "اختر منتجاً واحداً على الأقل",
    addressesLoadFailed: "فشل تحميل العناوين",
    addressSaveFailed: "فشل حفظ العنوان",
    addressUpdateFailed: "فشل تعديل العنوان",
    addressDeleteFailed: "فشل حذف العنوان",
    outsideCoverage: "العنوان خارج نطاق التغطية",
    coverageCheckFailed: "فشل التحقق من نطاق التغطية",
    paymentNotFound: "الدفعة غير موجودة",
    paymentVerifyFailed: "فشل التحقق من الدفع",
    customersLoadFailed: "فشل تحميل العملاء",
    categoryParentInvalid: "الفئة الأب غير صالحة",
    aiImageFailed: "فشل تعديل الصورة بالذكاء الاصطناعي",
    aiDescriptionFailed: "فشل إنشاء الوصف",
    smartProductFailed: "فشل التسجيل الذكي للمنتج",
    smartProductNoImages: "لا توجد صور للمعالجة",
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
      campaigns: "الخصومات والحملات",
      orders: "الطلبات",
      reports: "التقارير المالية",
      coverage: "نطاق التغطية",
      customers: "العملاء",
      smartProduct: "تسجيل ذكي",
    },
    navGroups: {
      overview: "عام",
      catalog: "الكتالوج",
      marketing: "التسويق",
      operations: "العمليات",
      insights: "التقارير",
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
      subtitle: "المبيعات والمخزون والطلبات في نظرة واحدة",
      salesToday: "مبيعات اليوم",
      salesWeek: "مبيعات آخر ٧ أيام",
      salesMonth: "مبيعات هذا الشهر",
      activeOrders: "طلبات نشطة",
      liveCampaigns: "حملات نشطة",
      inventory: "مخزون المستودع",
      activeProducts: "{count} منتج نشط",
      outOfStock: "نفد المخزون",
      lowStockTitle: "أقل من الحد المحدد",
      topSellers: "الأكثر مبيعاً هذا الشهر",
      topSellersEmpty: "لا توجد طلبات هذا الشهر بعد.",
      soldCount: "{count} عملية بيع",
      viewReports: "التقرير الكامل",
      viewOrders: "كل الطلبات",
      viewProducts: "إدارة المخزون",
      salesTrend: "اتجاه المبيعات",
      chartRevenue: "المبيعات",
      chartOrders: "الطلبات",
      inventorySplit: "حالة المخزون",
      stockOk: "مخزون كافٍ",
      orderStatusChart: "حالة الطلبات",
      productsCard: "إدارة المنتجات",
      productsDesc: "إضافة، صورة، مخزون",
      ordersCard: "إدارة الطلبات",
      ordersDesc: "الحالة والسائق",
      reportsCard: "التقارير المالية",
      reportsDesc: "الإيرادات والمخزون المنخفض",
      customersCard: "العملاء",
      customersDesc: "القائمة وسجل المشتريات",
      coverageCard: "نطاق التغطية",
      coverageDesc: "خريطة التوصيل",
      categoriesCard: "الفئات",
      categoriesDesc: "إضافة وتعديل فئات المنتجات",
      brandsCard: "العلامات التجارية",
      brandsDesc: "تعريف وإدارة علامات المنتجات",
      bannersCard: "بانر الصفحة الرئيسية",
      bannersDesc: "عدة بانرات لشريط المتجر",
      campaignsCard: "الخصومات والعروض",
      campaignsDesc: "حملات مؤقتة وخصومات على المنتجات",
      smartProductCard: "تسجيل المنتج بالذكاء الاصطناعي",
      smartProductDesc: "من صورة خام إلى محتوى جاهز للبيع",
      warehouseBadge: "لوحة الإدارة والمستودع",
      warehouseTitle: "التحكم اليومي بالمتجر",
      warehouseProducts: "إدارة المنتج والسعر والصور وحالة التفعيل",
      warehouseCategories: "إدارة تصنيفات شجرية بلا حد للعمق",
      warehouseUnits: "تسجيل المخزون بالعدد أو الوزن أو العبوة",
      warehouseAutoStock: "خصم المخزون تلقائياً بعد الطلب",
      warehouseAlerts: "منع بيع النافد والتنبيه عند انخفاض المخزون",
      warehouseOrders: "إدارة الطلبات والعملاء وحالة الطلب",
    },
    products: {
      title: "إدارة المنتجات",
      subtitle: "إضافة منتج، رفع صورة والتحكم بالمخزون",
      newProduct: "منتج جديد",
      smartRegister: "تسجيل ذكي بالذكاء الاصطناعي",
      editProduct: "تعديل المنتج",
      namePlaceholder: "اسم المنتج",
      slugPlaceholder: "slug-en",
      descriptionPlaceholder: "الوصف",
      descriptionSection: "وصف المنتج (ثلاث لغات)",
      descriptionFa: "فارسی",
      descriptionAr: "العربية",
      descriptionEn: "English",
      aiDescriptionAll: "إنشاء الوصف بالذكاء الاصطناعي",
      priceLabel: "السعر (ريال عماني)",
      compareAtPriceLabel: "السعر قبل الخصم (ريال عماني)",
      pricePlaceholder: "مثلاً 1,250",
      stockLabel: "المخزون",
      inventoryUnit: "نوع المخزون",
      unitCount: "عددي",
      unitWeight: "وزني (كيلو)",
      unitPack: "عبوة",
      lowStockThreshold: "حد التنبيه لانخفاض المخزون",
      lowStock: "مخزون منخفض",
      noCategory: "بدون فئة",
      brandLabel: "العلامة التجارية",
      noBrand: "بدون علامة",
      featuresSection: "مواصفات المنتج",
      featureLabelPlaceholder: "اسم المواصفة (مثل الوزن)",
      featureValuePlaceholder: "القيمة (مثل 1 كجم)",
      addFeature: "إضافة مواصفة",
      removeFeature: "حذف",
      imageUrlPlaceholder: "رابط الصورة (أو ارفع ملفاً)",
      imagesSection: "صور المنتج",
      imagesHint: "ارفع عدة زوايا للمنتج. الصورة الأولى هي صورة البطاقة وصفحة المنتج.",
      uploadImages: "رفع عدة صور",
      addImageUrl: "إضافة رابط",
      setPrimaryImage: "صورة رئيسية",
      primaryImage: "رئيسية",
      removeImage: "حذف",
      maxImages: "حتى {count} صور",
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
      saveStock: "حفظ المخزون",
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
      validationPrice: "أدخل سعر المنتج",
      validationCompareAt: "أدخل السعر قبل الخصم",
      validationCompareAtMin: "يجب أن يكون السعر قبل الخصم مساوياً أو أعلى من سعر البيع",
      aiStubDescription: "{name} — منتج طازج وعالي الجودة{category}.",
      aiStubCategorySuffix: " في فئة {category}",
    },
    smartProduct: {
      title: "تسجيل المنتج بالذكاء الاصطناعي",
      subtitle: "من صورة خام إلى محتوى جاهز للبيع",
      uploadTitle: "صورة المنتج",
      uploadHint: "التقط أو ارفع عدة زوايا للعبوة. يحسّن الذكاء الاصطناعي الصورة ويقترح المحتوى.",
      uploadButton: "التقاط أو رفع صورة",
      maxPhotos: "حتى {count} صور",
      removePhoto: "حذف",
      hintName: "اسم المنتج (اختياري)",
      hintNamePlaceholder: "اكتب الاسم إذا لم يكن واضحاً على العبوة",
      categoryOptional: "الفئة (اختياري)",
      processButton: "تحسين الصورة وإنشاء المحتوى",
      processing: "جارٍ إعداد المسودة…",
      processingEnhance: "إزالة الخلفية وتوحيد الصور",
      processingContent: "اقتراح الاسم والوصف بثلاث لغات",
      before: "قبل",
      after: "بعد",
      pickPrimary: "اختر صورة الكتالوج الرئيسية",
      primaryBadge: "الصورة الرئيسية",
      reviewTitle: "مراجعة المشرف",
      reviewHint: "عدّل النص والسعر ثم سجّل المنتج في الكتالوج.",
      publish: "تسجيل في الكتالوج",
      startOver: "البدء من جديد",
      noImages: "اختر صورة واحدة على الأقل",
      fallbackNotice: "لم يُضبط نموذج الرؤية. أكمل المسودة يدوياً أو أضف GEMINI_API_KEY أو OPENAI_API_KEY.",
      stepPhoto: "صورة المنتج",
      stepEnhance: "تحسين الصورة",
      stepContent: "إنشاء المحتوى",
      stepReview: "المراجعة",
      stepPublish: "تسجيل الكتالوج",
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
      parentLabel: "الفئة الأب",
      noParent: "بدون أب (فئة رئيسية)",
      childBadge: "فئة فرعية",
      nestedHint: "يمكن أن تحتوي كل فئة على فئات فرعية بلا حد.",
    },
    banners: {
      title: "بانر الصفحة الرئيسية",
      subtitle: "عدة بانرات لشريط المتجر",
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
      save: "حفظ",
      create: "إنشاء",
      cancel: "إلغاء",
      edit: "تعديل",
      delete: "حذف",
      previewTitle: "معاينة",
      newBanner: "بانر جديد",
      editBanner: "تعديل البانر",
      empty: "لا توجد بانرات.",
      loading: "جاري التحميل…",
      sortOrderLabel: "ترتيب العرض",
      activeLabel: "إظهار في المتجر",
      inactiveLabel: "غير نشط",
    },
    campaigns: {
      title: "الخصومات والحملات",
      subtitle: "عروض خاصة وحملات مؤقتة على منتجات مختارة",
      newCampaign: "حملة جديدة",
      editCampaign: "تعديل الحملة",
      namePlaceholder: "اسم الحملة",
      badgePlaceholder: "الشارة على البطاقة (مثلاً عرض خاص)",
      bannerHint: "تظهر هذه الصورة في بانرات الصفحة الرئيسية فقط عندما تكون الحملة نشطة وضمن مدتها.",
      bannerLabel: "صورة بانر الصفحة الرئيسية",
      uploadImage: "رفع صورة البانر",
      removeImage: "إزالة صورة البانر",
      typeLabel: "نوع الخصم",
      typePercent: "نسبة مئوية",
      typeFixed: "مبلغ ثابت",
      valueLabel: "قيمة الخصم",
      startsAt: "البداية",
      endsAt: "النهاية",
      activeLabel: "نشطة",
      homeLabel: "عرض في عروض الصفحة الرئيسية",
      productsLabel: "المنتجات المشمولة",
      productSearch: "بحث عن منتج",
      noProducts: "لا توجد منتجات.",
      selectedCount: "{count} منتج محدد",
      productCount: "{count} منتج",
      percentOff: "خصم {value}٪",
      fixedOff: "خصم {value} ر.ع.",
      save: "حفظ",
      create: "إنشاء",
      cancel: "إلغاء",
      edit: "تعديل",
      delete: "حذف",
      loading: "جاري التحميل…",
      empty: "لا توجد حملات.",
      status: {
        live: "جارية",
        scheduled: "مجدولة",
        ended: "منتهية",
        inactive: "غير نشطة",
      },
    },
    orders: {
      title: "الطلبات",
      loading: "جاري التحميل…",
      empty: "لا توجد طلبات.",
      orderPrefix: "طلب",
      riderPlaceholder: "UUID السائق",
      assignRider: "تعيين سائق",
      customer: "العميل",
      payment: "الدفع",
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
      weekly: "أسبوعي",
      monthly: "شهري",
      daily: "يومي",
    },
    customers: {
      title: "العملاء",
      subtitle: "قائمة العملاء وسجل المشتريات",
      loading: "جاري تحميل العملاء…",
      empty: "لا يوجد عملاء.",
      colName: "الاسم",
      colPhone: "الهاتف",
      colOrders: "الطلبات",
      colSpent: "الإنفاق",
      colJoined: "الانضمام",
      entityName: "العملاء",
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
      confirmOffTitle: "هل تريد إخفاء الأسعار في كل المتجر؟",
      confirmOffDesc: "سيؤدي هذا إلى إخفاء أسعار المنتجات لجميع العملاء وتعطيل سلة التسوق.",
      confirmOffAction: "نعم، أخفِ الأسعار",
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
  brand: { name: "EliMarket", nameLocal: "EliMarket", currency: "OMR" },
  nav: {
    home: "Home",
    categories: "Categories",
    search: "Search",
    orders: "Orders",
    account: "Account",
    cart: "Cart",
    searchShortcut: "Search",
    trackOrder: "Track order",
    help: "Help",
    accountSignIn: "Account / Sign in",
    signIn: "Sign in",
  },
  home: {
    deliverTo: "Deliver to",
    locationSample: "Muscat, Al Khoudh",
    searchPlaceholder: "Search products…",
    heroBadge: "Special offer",
    heroTitle: "Fresh daily groceries",
    heroSubtitle: "Fast delivery within 2 hours",
    heroCta: "Shop now",
    heroSlide2Badge: "Special savings",
    heroSlide2Title: "Fresh dairy every day",
    heroSlide2Subtitle: "Up to 25% off selected items",
    heroSlide3Badge: "Free delivery",
    heroSlide3Title: "On orders above 10 OMR",
    heroSlide3Subtitle: "Fast delivery in your area",
    heroCarouselLabel: "Store banners",
    heroPrev: "Previous slide",
    heroNext: "Next slide",
    heroGoToSlide: "Go to slide {n}",
    campaignPercentOff: "{value}% off",
    campaignFixedOff: "{value} OMR off",
    flashDeals: "Flash Deals",
    flashEnds: "Ends: 02:45:18",
    flashEndsIn: "Ends in",
    categoriesTitle: "Shop by category",
    viewAll: "View all",
    allProducts: "All products",
    loadingProducts: "Loading products…",
    noProducts: "No products found.",
    fallbackProduce: "Produce",
    fallbackDairy: "Dairy",
    fallbackMeat: "Meat",
    fallbackBakery: "Bakery",
    searchPlaceholderDesktop: "Search for products, brands and categories",
    utilityFreeDelivery: "Free delivery on orders over {amount} · Muscat & Seeb",
    shopByCategory: "Shop by category",
    refine: "Refine",
    inStockOnly: "In stock only",
    onCampaign: "On campaign",
    organic: "Organic",
    sameDayDelivery: "Same-day delivery — Order before 4 PM, get it tonight 8–10 PM.",
    sameDayDeliveryTitle: "Same-day delivery",
    sameDayDeliveryBody: "Order before 4 PM, get it tonight 8–10 PM.",
    heroFreshThisWeek: "FRESH THIS WEEK",
    filterLabel: "Filter",
    pillCampaigns: "Campaigns",
    pillNewest: "Newest",
    pillBestSellers: "Best sellers",
    pillDiscounted: "Discounted",
    pillUnderOne: "Under OMR 1",
    pillLocal: "Local produce",
    browseDeals: "Browse deals",
    heroDesktopTitle: "Fresh essentials, delivered to you",
    heroDesktopSubtitle: "Save up to {highlight} on daily basics.",
    allCategories: "All categories",
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
    addShort: "Add",
    fallbackName: "Product",
    vatIncluded: "Inclusive of VAT",
    quantity: "Quantity",
    unitCount: "pcs",
    unitWeight: "kg",
    unitPack: "pack",
    share: "Share",
    wishlist: "Wishlist",
    zoom: "Zoom image",
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
    saveAddress: "Save address",
    editAddress: "Edit",
    deleteAddress: "Delete",
    pickOnMap: "Pick the location on the map",
    outsideCoverage: "This address is outside the delivery area",
    coverageOk: "This address is inside the delivery area",
    paymentRedirecting: "Redirecting to the payment gateway…",
    payNow: "Pay for order",
    paymentPending: "Payment is pending confirmation",
    paymentFailed: "Payment failed",
    paymentSuccess: "Payment completed successfully",
    sandboxPay: "Confirm sandbox payment",
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
    allCategories: "All categories",
    allCampaigns: "All campaigns",
    minPrice: "Min price",
    maxPrice: "Max price",
    onSale: "On sale only",
    sortNewest: "Newest",
    sortPriceAsc: "Price: low to high",
    sortPriceDesc: "Price: high to low",
    filters: "Filters",
    clearFilters: "Clear filters",
    resultsCount: "{count} products",
    sortLabel: "Sort",
    categoryLabel: "Category",
    campaignLabel: "Campaign",
    priceLabel: "Price",
  },
  pwa: {
    install: "Install app",
    installTitle: "Install EliMarket",
    installDesc: "Faster access to the store, even without the browser",
    dismiss: "Not now",
  },
  categories: {
    title: "Categories",
    searchInCategories: "Search categories",
    back: "Categories",
    subcategoryCount: "{count} subcategories",
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
    saving: "Saving…",
    processing: "Working…",
    uploading: "Uploading…",
    back: "Back",
    free: "Free",
    error: "Error",
    language: "Language",
    themeLight: "Light theme",
    themeDark: "Dark theme",
    cancel: "Cancel",
    delete: "Delete",
    confirmDeleteTitle: "Are you sure?",
    confirmDelete: "This item will be deleted and cannot be undone.",
  },
  notifications: {
    successTitle: "Success",
    errorTitle: "Error",
    infoTitle: "Info",
    warningTitle: "Warning",
    otpSent: "Code sent",
    loginSuccess: "Signed in successfully",
    addressSaved: "Address saved",
    addressUpdated: "Address updated",
    addressDeleted: "Address deleted",
    orderPlaced: "Order placed",
    addedToCart: "Added to cart",
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
    bannerCreated: "Banner created",
    bannerUpdated: "Banner updated",
    bannerDeleted: "Banner deleted",
    campaignCreated: "Campaign created",
    campaignUpdated: "Campaign updated",
    campaignDeleted: "Campaign deleted",
    smartProductReady: "Product draft is ready",
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
    bannersLoadFailed: "Failed to load banners",
    bannerCreateFailed: "Failed to create banner",
    bannerUpdateFailed: "Failed to update banner",
    bannerDeleteFailed: "Failed to delete banner",
    campaignsLoadFailed: "Failed to load campaigns",
    campaignCreateFailed: "Failed to create campaign",
    campaignUpdateFailed: "Failed to update campaign",
    campaignDeleteFailed: "Failed to delete campaign",
    campaignNameRequired: "Campaign name is required",
    campaignDatesRequired: "Start and end dates are required",
    campaignWindowInvalid: "End time must be after start time",
    campaignDiscountRequired: "Discount value is invalid",
    campaignPercentMax: "Percent discount cannot exceed 90",
    campaignProductsRequired: "Select at least one product",
    addressesLoadFailed: "Failed to load addresses",
    addressSaveFailed: "Failed to save address",
    addressUpdateFailed: "Failed to update address",
    addressDeleteFailed: "Failed to delete address",
    outsideCoverage: "Address is outside the coverage area",
    coverageCheckFailed: "Failed to check coverage area",
    paymentNotFound: "Payment not found",
    paymentVerifyFailed: "Failed to verify payment",
    customersLoadFailed: "Failed to load customers",
    categoryParentInvalid: "Invalid parent category",
    aiImageFailed: "AI image edit failed",
    aiDescriptionFailed: "Failed to generate description",
    smartProductFailed: "Smart product listing failed",
    smartProductNoImages: "No images to process",
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
      banners: "Homepage banners",
      campaigns: "Sales & campaigns",
      orders: "Orders",
      reports: "Financial reports",
      coverage: "Coverage area",
      customers: "Customers",
      smartProduct: "Smart listing",
    },
    navGroups: {
      overview: "Overview",
      catalog: "Catalog",
      marketing: "Marketing",
      operations: "Operations",
      insights: "Insights",
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
      subtitle: "Sales, stock, and orders at a glance",
      salesToday: "Today’s sales",
      salesWeek: "Last 7 days",
      salesMonth: "This month",
      activeOrders: "Active orders",
      liveCampaigns: "Live campaigns",
      inventory: "Warehouse stock",
      activeProducts: "{count} active products",
      outOfStock: "Out of stock",
      lowStockTitle: "Below stock threshold",
      topSellers: "Best sellers this month",
      topSellersEmpty: "No orders recorded this month yet.",
      soldCount: "{count} sold",
      viewReports: "Full report",
      viewOrders: "All orders",
      viewProducts: "Manage stock",
      salesTrend: "Sales trend",
      chartRevenue: "Sales",
      chartOrders: "Orders",
      inventorySplit: "Stock status",
      stockOk: "In stock",
      orderStatusChart: "Order status",
      productsCard: "Manage products",
      productsDesc: "Add, images, stock",
      ordersCard: "Manage orders",
      ordersDesc: "Status & riders",
      reportsCard: "Financial reports",
      reportsDesc: "Revenue & low stock",
      customersCard: "Customers",
      customersDesc: "List and purchase history",
      coverageCard: "Coverage area",
      coverageDesc: "Delivery map",
      categoriesCard: "Categories",
      categoriesDesc: "Add and edit product categories",
      brandsCard: "Brands",
      brandsDesc: "Define and manage product brands",
      bannersCard: "Homepage banners",
      bannersDesc: "Multiple slides for the storefront carousel",
      campaignsCard: "Discounts & sales",
      campaignsDesc: "Timed campaigns and product discounts",
      smartProductCard: "Smart product listing",
      smartProductDesc: "From a raw photo to ready-to-sell catalog content",
      warehouseBadge: "Admin and warehouse panel",
      warehouseTitle: "Daily store control",
      warehouseProducts: "Manage products, prices, images, and active status",
      warehouseCategories: "Unlimited nested category trees",
      warehouseUnits: "Stock by count, weight, or pack",
      warehouseAutoStock: "Automatic stock deduction after an order",
      warehouseAlerts: "Block out-of-stock sales and alert on low stock",
      warehouseOrders: "Manage orders, customers, and order status",
    },
    products: {
      title: "Product management",
      subtitle: "Add products, upload images, control stock",
      newProduct: "New product",
      smartRegister: "Smart AI listing",
      editProduct: "Edit product",
      namePlaceholder: "Product name",
      slugPlaceholder: "slug-en",
      descriptionPlaceholder: "Description",
      descriptionSection: "Product description (3 languages)",
      descriptionFa: "Persian",
      descriptionAr: "Arabic",
      descriptionEn: "English",
      aiDescriptionAll: "Generate descriptions with AI",
      priceLabel: "Price (OMR)",
      compareAtPriceLabel: "Original price (OMR)",
      pricePlaceholder: "e.g. 1,250",
      stockLabel: "Stock",
      inventoryUnit: "Inventory type",
      unitCount: "Count",
      unitWeight: "Weight (kg)",
      unitPack: "Pack",
      lowStockThreshold: "Low-stock alert threshold",
      lowStock: "Low stock",
      noCategory: "No category",
      brandLabel: "Brand",
      noBrand: "No brand",
      featuresSection: "Product specifications",
      featureLabelPlaceholder: "Spec name (e.g. Weight)",
      featureValuePlaceholder: "Value (e.g. 1 kg)",
      addFeature: "Add specification",
      removeFeature: "Remove",
      imageUrlPlaceholder: "Image URL (or upload)",
      imagesSection: "Product images",
      imagesHint: "Upload several angles of the product. The first image is the catalog cover.",
      uploadImages: "Upload images",
      addImageUrl: "Add URL",
      setPrimaryImage: "Set as cover",
      primaryImage: "Cover",
      removeImage: "Remove",
      maxImages: "Up to {count} images",
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
      saveStock: "Save stock",
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
      validationPrice: "Enter the product price",
      validationCompareAt: "Enter the price before discount",
      validationCompareAtMin: "Original price must be equal to or higher than the selling price",
      aiStubDescription: "{name} — fresh, high-quality product{category}.",
      aiStubCategorySuffix: " in {category} category",
    },
    smartProduct: {
      title: "Smart product listing",
      subtitle: "From a raw photo to ready-to-sell catalog content",
      uploadTitle: "Product photo",
      uploadHint: "Take or upload several pack angles. AI improves the image and drafts the listing copy.",
      uploadButton: "Take or upload photos",
      maxPhotos: "Up to {count} photos",
      removePhoto: "Remove",
      hintName: "Product name (optional)",
      hintNamePlaceholder: "Add a name if the pack is hard to read",
      categoryOptional: "Category (optional)",
      processButton: "Enhance images and generate copy",
      processing: "Preparing the draft…",
      processingEnhance: "Removing backgrounds and cleaning photos",
      processingContent: "Suggesting a title and trilingual descriptions",
      before: "Before",
      after: "After",
      pickPrimary: "Choose the catalog image",
      primaryBadge: "Primary image",
      reviewTitle: "Admin review",
      reviewHint: "Edit the copy and price, then publish to the catalog.",
      publish: "Publish to catalog",
      startOver: "Start over",
      noImages: "Select at least one photo",
      fallbackNotice: "No vision model is configured. Complete the draft yourself, or set GEMINI_API_KEY or OPENAI_API_KEY.",
      stepPhoto: "Product photo",
      stepEnhance: "Image enhancement",
      stepContent: "Content generation",
      stepReview: "Review",
      stepPublish: "Catalog listing",
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
      parentLabel: "Parent category",
      noParent: "No parent (top-level)",
      childBadge: "Subcategory",
      nestedHint: "Any category can have unlimited nested children.",
    },
    banners: {
      title: "Homepage banners",
      subtitle: "Manage multiple hero slides for the storefront",
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
      save: "Save",
      create: "Create",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      previewTitle: "Preview",
      newBanner: "New banner",
      editBanner: "Edit banner",
      empty: "No banners yet.",
      loading: "Loading…",
      sortOrderLabel: "Display order",
      activeLabel: "Show in store",
      inactiveLabel: "Inactive",
    },
    campaigns: {
      title: "Discounts & campaigns",
      subtitle: "Special sales and timed campaigns on selected products",
      newCampaign: "New campaign",
      editCampaign: "Edit campaign",
      namePlaceholder: "Campaign name (e.g. Friday sale)",
      badgePlaceholder: "Card badge (e.g. Special sale)",
      bannerHint: "This image appears in homepage banners only while the campaign is active and within its time window.",
      bannerLabel: "Homepage banner image",
      uploadImage: "Upload banner image",
      removeImage: "Remove banner image",
      typeLabel: "Discount type",
      typePercent: "Percent off",
      typeFixed: "Fixed amount off",
      valueLabel: "Discount value",
      startsAt: "Starts",
      endsAt: "Ends",
      activeLabel: "Active",
      homeLabel: "Show in homepage flash deals",
      productsLabel: "Included products",
      productSearch: "Search products",
      noProducts: "No products found.",
      selectedCount: "{count} products selected",
      productCount: "{count} products",
      percentOff: "{value}% off",
      fixedOff: "{value} OMR off",
      save: "Save",
      create: "Create",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      loading: "Loading…",
      empty: "No campaigns yet.",
      status: {
        live: "Live",
        scheduled: "Scheduled",
        ended: "Ended",
        inactive: "Inactive",
      },
    },
    orders: {
      title: "Orders",
      loading: "Loading…",
      empty: "No orders found.",
      orderPrefix: "Order",
      riderPlaceholder: "Rider UUID",
      assignRider: "Assign rider",
      customer: "Customer",
      payment: "Payment",
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
      weekly: "Weekly",
      monthly: "Monthly",
      daily: "Daily",
    },
    customers: {
      title: "Customers",
      subtitle: "Customer list and purchase history",
      loading: "Loading customers…",
      empty: "No customers yet.",
      colName: "Name",
      colPhone: "Phone",
      colOrders: "Orders",
      colSpent: "Spent",
      colJoined: "Joined",
      entityName: "Customers",
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
      confirmOffTitle: "Hide prices storewide?",
      confirmOffDesc: "This hides product prices for every customer and disables the cart.",
      confirmOffAction: "Yes, hide prices",
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
