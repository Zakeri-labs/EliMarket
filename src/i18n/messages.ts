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
    menu: string;
    searchShortcut: string;
    trackOrder: string;
    help: string;
    accountSignIn: string;
    signIn: string;
  };
  home: {
    deliverTo: string;
    locationSample: string;
    outOfServiceAreaTitle: string;
    outOfServiceArea: string;
    outOfServiceAreaAck: string;
    comingSoonTag: string;
    deliverAreaMuscatKhoudh: string;
    deliverAreaMuscatGhubra: string;
    deliverAreaSeeb: string;
    deliverAreaSohar: string;
    deliverAreaSalalah: string;
    deliverAreaNizwa: string;
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
    flashHrsLabel: string;
    flashMinLabel: string;
    flashSecLabel: string;
    flashDaysLabel: string;
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
    filtersTitle: string;
    resetAll: string;
    clear: string;
    showResults: string;
    collectionsLabel: string;
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
    atAGlance: string;
    similarProducts: string;
    noSimilarProducts: string;
    freeDeliveryOver: string;
    breadcrumbHome: string;
    sku: string;
    size: string;
    reviewsTab: string;
    questionsTab: string;
    writeReview: string;
    yourRating: string;
    reviewPlaceholder: string;
    submitReview: string;
    signInToReview: string;
    noReviewsYet: string;
    reviewsCount: string;
    anonymousReviewer: string;
    askQuestion: string;
    questionPlaceholder: string;
    submitQuestion: string;
    signInToAsk: string;
    noQuestionsYet: string;
    awaitingAnswer: string;
    storeAnswer: string;
    questionsCount: string;
    buyNow: string;
    deliveryServiceTitle: string;
    sameDayDelivery: string;
    sameDayDeliveryNote: string;
    easyReturns: string;
    easyReturnsNote: string;
    pickupInStore: string;
    pickupInStoreNote: string;
    frequentlyBoughtTogether: string;
    seeAll: string;
    removeFromCart: string;
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
    cashFee: string;
    total: string;
    submitOrder: string;
  };
  addressGate: {
    title: string;
    description: string;
    later: string;
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
    gotIt: string;
    iosHint: string;
    iosShare: string;
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
    signInToContinue: string;
    phonePlaceholder: string;
    getCode: string;
    otpPlaceholder: string;
    confirm: string;
    ordersLabel: string;
    addressesLabel: string;
    favouritesLabel: string;
    deliveryAddresses: string;
    favourites: string;
    language: string;
    theme: string;
    addressesTitle: string;
    favouritesTitle: string;
    noAddressesYet: string;
    noFavouritesYet: string;
    setDefault: string;
    defaultBadge: string;
    addNewAddress: string;
    changeAvatar: string;
    removeAvatar: string;
    avatarHint: string;
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
  receipt: Record<string, string>;
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
    productExtrasShown: string;
    productExtrasHidden: string;
    cashSurchargeSaved: string;
    receiptSettingsSaved: string;
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
    avatarUpdated: string;
    avatarRemoved: string;
    orderStatusUpdated: string;
    orderAccepted: string;
    orderPickedUp: string;
    orderDelivered: string;
    orderReturned: string;
    riderRegistered: string;
    riderApproved: string;
    riderRevoked: string;
  };
  errors: {
    operationFailed: string;
    unexpectedError: string;
    networkError: string;
    done: string;
    warning: string;
    otpSendFailed: string;
    loginFailed: string;
    invalidOtp: string;
    adminForbidden: string;
    riderForbidden: string;
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
    avatarUploadFailed: string;
    avatarRemoveFailed: string;
    avatarRequired: string;
    avatarInvalidType: string;
    avatarTooLarge: string;
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
    riderAssignNotReady: string;
    ridersLoadFailed: string;
    statusUpdateFailed: string;
    notificationsLoadFailed: string;
    notificationUpdateFailed: string;
    notificationDeleteFailed: string;
    orderAcceptFailed: string;
    financeLoadFailed: string;
    riderRegisterFailed: string;
    riderApproveFailed: string;
    riderRevokeFailed: string;
    riderCivilIdInvalid: string;
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
    reviewsLoadFailed: string;
    reviewCreateFailed: string;
    reviewAlreadyExists: string;
    reviewDeleteFailed: string;
    questionsLoadFailed: string;
    questionCreateFailed: string;
    questionAnswerFailed: string;
    questionDeleteFailed: string;
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
      riders: string;
      smartProduct: string;
      reviews: string;
      questions: string;
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
      skuPlaceholder: string;
      variantOfLabel: string;
      noVariantParent: string;
      variantLabelPlaceholder: string;
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
      webSourced: string;
      aiGenerated: string;
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
      uploadLogo: string;
      removeLogo: string;
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
    reviews: {
      title: string;
      subtitle: string;
      empty: string;
      delete: string;
      byLabel: string;
    };
    questions: {
      title: string;
      subtitle: string;
      empty: string;
      answer: string;
      delete: string;
      answerModalTitle: string;
      answerPlaceholder: string;
      submitAnswer: string;
      awaitingBadge: string;
      answeredBadge: string;
      askedByLabel: string;
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
      textSection: string;
      textLangHint: string;
      badgePlaceholder: string;
      titlePlaceholder: string;
      subtitlePlaceholder: string;
      ctaLabelPlaceholder: string;
      ctaHrefPlaceholder: string;
      imageUrlPlaceholder: string;
      imageRtlLabel: string;
      imageLtrLabel: string;
      imageLtrHint: string;
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
      subtitle: string;
      loading: string;
      empty: string;
      orderPrefix: string;
      riderPlaceholder: string;
      riderLabel: string;
      assignRider: string;
      assignAfterPreparing: string;
      assignedRider: string;
      statusLabel: string;
      statusHint: string;
      customer: string;
      payment: string;
      printInvoice: string;
      pickedUpAt: string;
      viewDeliveryProof: string;
      failedDeliveryTitle: string;
      failedDeliveryNote: string;
      viewFailPhoto: string;
      failReason: Record<string, string>;
      status: Record<string, string>;
    };
    receiptSettings: Record<string, string>;
    notifCenter: {
      title: string;
      empty: string;
      markAllRead: string;
      clearRead: string;
      newOrderToast: string;
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
    riders: {
      title: string;
      subtitle: string;
      registerTitle: string;
      registerHint: string;
      register: string;
      firstName: string;
      lastName: string;
      civilId: string;
      civilIdPlaceholder: string;
      civilIdHint: string;
      phone: string;
      phonePlaceholder: string;
      address: string;
      addressPlaceholder: string;
      approveFormHint: string;
      listTitle: string;
      entityName: string;
      colName: string;
      colCivilId: string;
      colPhone: string;
      colAddress: string;
      colJoined: string;
      colActions: string;
      revoke: string;
      approveTitle: string;
      approveHint: string;
      approveEmpty: string;
      approve: string;
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
    productExtrasToggle: {
      title: string;
      onDesc: string;
      offDesc: string;
      on: string;
      off: string;
    };
    cashSurcharge: {
      title: string;
      desc: string;
      label: string;
      save: string;
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
  rider: {
    panelLabel: string;
    loginTitle: string;
    loginSubtitle: string;
    ordersTitle: string;
    financeTitle: string;
    readyTitle: string;
    readyEmpty: string;
    activeTitle: string;
    activeHint: string;
    activeEmpty: string;
    recentTitle: string;
    historyEmpty: string;
    accept: string;
    markPickedUp: string;
    pickupHint: string;
    pickedUpAt: string;
    markDelivered: string;
    markUndelivered: string;
    proof: {
      deliveredTitle: string;
      deliveredDescription: string;
      takePhoto: string;
      retakePhoto: string;
      photoRequired: string;
      uploading: string;
      confirmDelivered: string;
    };
    undelivered: {
      title: string;
      description: string;
      reasonLabel: string;
      reasons: {
        customer_absent: string;
        no_answer: string;
        wrong_address: string;
        customer_refused: string;
        other: string;
      };
      noteLabel: string;
      notePlaceholder: string;
      noteRequired: string;
      photoLabel: string;
      submit: string;
    };
    tabs: {
      assigned: string;
      ready: string;
      history: string;
    };
    nav: {
      orders: string;
      finance: string;
    };
    finance: {
      deliveredCount: string;
      totalSales: string;
      deliveryFees: string;
      cashCollected: string;
      hint: string;
    };
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
    menu: "منو",
    searchShortcut: "جستجو",
    trackOrder: "پیگیری سفارش",
    help: "راهنما",
    accountSignIn: "حساب / ورود",
    signIn: "ورود",
  },
  home: {
    deliverTo: "تحویل به",
    locationSample: "مسقط، الخوض",
    outOfServiceAreaTitle: "این منطقه هنوز پوشش داده نمی‌شود",
    outOfServiceArea: "در حال حاضر به {area} سرویس‌دهی نداریم. تیم ما به‌سرعت در حال گسترش مناطق تحت پوشش است و به‌زودی خدمات ما به این منطقه هم می‌رسد. از همراهی و صبوری شما سپاسگزاریم.",
    outOfServiceAreaAck: "متوجه شدم",
    comingSoonTag: "به‌زودی",
    deliverAreaMuscatKhoudh: "مسقط، الخوض",
    deliverAreaMuscatGhubra: "مسقط، الغبره",
    deliverAreaSeeb: "السیب",
    deliverAreaSohar: "صحار",
    deliverAreaSalalah: "صلاله",
    deliverAreaNizwa: "نزوی",
    searchPlaceholder: "جستجوی محصول…",
    heroBadge: "خرید روزانه",
    heroTitle: "همه‌چیز برای سفره‌ی خانه",
    heroSubtitle: "سفارش بده، همان روز دم در تحویل بگیر",
    heroCta: "همین حالا سفارش بده",
    heroSlide2Badge: "تخفیف‌های هفته",
    heroSlide2Title: "میوه و سبزی تازه با قیمت کمتر",
    heroSlide2Subtitle: "تا ۲۵٪ تخفیف روی اقلام منتخب این هفته",
    heroSlide3Badge: "ارسال رایگان",
    heroSlide3Title: "اولین سفارشت مهمان ماست",
    heroSlide3Subtitle: "ارسال رایگان برای خریدهای بالای ۱۰ ریال عمان",
    heroCarouselLabel: "بنرهای فروشگاه",
    heroPrev: "اسلاید قبلی",
    heroNext: "اسلاید بعدی",
    heroGoToSlide: "رفتن به اسلاید {n}",
    campaignPercentOff: "{value}٪ تخفیف",
    campaignFixedOff: "{value} ریال عمان تخفیف",
    flashDeals: "پیشنهاد لحظه‌ای",
    flashEnds: "پایان: ۰۲:۴۵:۱۸",
    flashEndsIn: "پایان در",
    flashHrsLabel: "ساعت",
    flashMinLabel: "دقیقه",
    flashSecLabel: "ثانیه",
    flashDaysLabel: "روز",
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
    filtersTitle: "فیلترها",
    resetAll: "بازنشانی همه",
    clear: "پاک کردن",
    showResults: "نمایش {count} نتیجه",
    collectionsLabel: "مجموعه‌ها",
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
    atAGlance: "نگاهی سریع",
    similarProducts: "محصولات مشابه",
    noSimilarProducts: "محصول مشابهی یافت نشد.",
    freeDeliveryOver: "ارسال رایگان برای سفارش‌های بالای {amount}",
    breadcrumbHome: "خانه",
    sku: "کد کالا: {sku}",
    size: "سایز",
    reviewsTab: "نظرات ({count})",
    questionsTab: "پرسش‌ها ({count})",
    writeReview: "ثبت نظر",
    yourRating: "امتیاز شما",
    reviewPlaceholder: "نظر خود را درباره این محصول بنویسید...",
    submitReview: "ارسال نظر",
    signInToReview: "برای ثبت نظر وارد شوید",
    noReviewsYet: "هنوز نظری ثبت نشده است.",
    reviewsCount: "{average} · {count} نظر",
    anonymousReviewer: "مشتری",
    askQuestion: "پرسیدن سوال",
    questionPlaceholder: "سوال خود را درباره این محصول بپرسید...",
    submitQuestion: "ارسال سوال",
    signInToAsk: "برای پرسیدن سوال وارد شوید",
    noQuestionsYet: "هنوز سوالی ثبت نشده است.",
    awaitingAnswer: "در انتظار پاسخ فروشگاه",
    storeAnswer: "پاسخ فروشگاه",
    questionsCount: "{count} سوال",
    buyNow: "خرید سریع — {price}",
    deliveryServiceTitle: "ارسال و خدمات",
    sameDayDelivery: "ارسال همان روز",
    sameDayDeliveryNote: "سفارش قبل از ساعت ۱۶ · تحویل ۲۰ تا ۲۲",
    easyReturns: "بازگشت آسان",
    easyReturnsNote: "در صورت آسیب‌دیدگی، هنگام تحویل مرجوع کنید",
    pickupInStore: "دریافت حضوری از فروشگاه",
    pickupInStoreNote: "آماده در ۲ ساعت · شعبه الخوض",
    frequentlyBoughtTogether: "معمولاً با هم خریداری می‌شوند",
    seeAll: "مشاهده همه",
    removeFromCart: "حذف از سبد خرید",
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
    cashFee: "هزینه پرداخت در محل",
    total: "جمع کل",
    submitOrder: "ثبت سفارش — {price}",
  },
  addressGate: {
    title: "آدرس محل تحویل خود را مشخص کنید",
    description: "برای ثبت سفارش، آدرس شما باید در محدوده پوشش ارسال ما باشد. لطفاً موقعیت خود را روی نقشه انتخاب کنید.",
    later: "بعداً",
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
    installDesc: "برای دسترسی سریع‌تر مثل یک اپلیکیشن، فروشگاه را روی گوشی نصب کنید.",
    dismiss: "الان نه",
    gotIt: "متوجه شدم",
    iosHint:
      "در Safari روی Share بزنید و گزینه Add to Home Screen را انتخاب کنید تا مثل اپ نصب شود.",
    iosShare: "Share → Add to Home Screen",
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
    signInToContinue: "برای مشاهده این صفحه ابتدا وارد حساب کاربری خود شوید",
    phonePlaceholder: "۰۹۱۲۳۴۵۶۷۸۹",
    getCode: "دریافت کد",
    otpPlaceholder: "کد ۶ رقمی",
    confirm: "تأیید",
    ordersLabel: "سفارش‌ها",
    addressesLabel: "آدرس‌ها",
    favouritesLabel: "علاقه‌مندی‌ها",
    deliveryAddresses: "آدرس‌های تحویل",
    favourites: "علاقه‌مندی‌ها",
    language: "زبان",
    theme: "پوسته",
    addressesTitle: "آدرس‌های من",
    favouritesTitle: "علاقه‌مندی‌های من",
    noAddressesYet: "هنوز آدرسی ثبت نکرده‌اید.",
    noFavouritesYet: "هنوز چیزی به علاقه‌مندی‌ها اضافه نکرده‌اید.",
    setDefault: "تنظیم به‌عنوان پیش‌فرض",
    defaultBadge: "پیش‌فرض",
    addNewAddress: "افزودن آدرس جدید",
    changeAvatar: "تغییر تصویر",
    removeAvatar: "حذف تصویر",
    avatarHint: "برای بهترین کیفیت، تصویر مربعی انتخاب کنید",
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
      onTheWay: "سفارش شما در مسیر است",
      orderDetails: "جزئیات سفارش",
      itemCount: "{count} قلم سفارش",
      callDriver: "تماس با پیک",
      contactRider: "تماس با پیک",
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
  receipt: {
    invoiceTitle: "فاکتور فروش",
    orderNo: "شماره سفارش",
    date: "تاریخ",
    customer: "مشتری",
    phone: "تلفن",
    address: "آدرس تحویل",
    deliverySlot: "بازه تحویل",
    payment: "پرداخت",
    paid: "پرداخت‌شده",
    unpaid: "پرداخت‌نشده",
    item: "کالا",
    qty: "تعداد",
    lineTotal: "مبلغ",
    subtotal: "جمع کالاها",
    deliveryAndVat: "هزینه ارسال و مالیات",
    cashFee: "هزینه پرداخت در محل",
    total: "مبلغ قابل پرداخت",
    print: "چاپ فاکتور",
    printSize: "اندازه کاغذ",
    loading: "در حال بارگذاری فاکتور…",
    notFound: "سفارش یافت نشد",
    printedAt: "چاپ‌شده در",
    thankYou: "از خرید شما سپاسگزاریم",
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
    productExtrasShown: "بخش جزئیات محصول (تب‌ها و خرید همزمان) نمایش داده می‌شود",
    productExtrasHidden: "بخش جزئیات محصول (تب‌ها و خرید همزمان) مخفی شد",
    cashSurchargeSaved: "هزینه پرداخت در محل ذخیره شد",
    receiptSettingsSaved: "تنظیمات فاکتور ذخیره شد",
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
    avatarUpdated: "تصویر پروفایل به‌روز شد",
    avatarRemoved: "تصویر پروفایل حذف شد",
    orderStatusUpdated: "وضعیت سفارش به‌روز شد",
    orderAccepted: "سفارش پذیرفته شد",
    orderPickedUp: "دریافت از فروشگاه ثبت شد",
    orderDelivered: "تحویل ثبت شد",
    orderReturned: "سفارش به صف آماده برگشت",
    riderRegistered: "پیک ثبت شد",
    riderApproved: "پیک تأیید شد",
    riderRevoked: "دسترسی پیک لغو شد",
  },
  errors: {
    operationFailed: "عملیات ناموفق بود",
    unexpectedError: "خطای غیرمنتظره",
    networkError: "ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.",
    done: "انجام شد",
    warning: "هشدار",
    otpSendFailed: "ارسال کد تأیید ناموفق بود",
    loginFailed: "ورود ناموفق بود",
    invalidOtp: "کد تأیید نامعتبر است",
    adminForbidden: "این حساب دسترسی ادمین ندارد",
    riderForbidden: "این حساب دسترسی پیک ندارد",
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
    avatarUploadFailed: "آپلود تصویر پروفایل ناموفق بود",
    avatarRemoveFailed: "حذف تصویر پروفایل ناموفق بود",
    avatarRequired: "لطفاً یک تصویر انتخاب کنید",
    avatarInvalidType: "فرمت تصویر پشتیبانی نمی‌شود",
    avatarTooLarge: "حجم تصویر نباید بیشتر از ۸ مگابایت باشد",
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
    riderAssignNotReady: "فقط سفارش‌های در وضعیت آماده‌سازی را می‌توان به پیک تخصیص داد",
    ridersLoadFailed: "بارگذاری پیک‌ها ناموفق بود",
    statusUpdateFailed: "به‌روزرسانی وضعیت ناموفق بود",
    notificationsLoadFailed: "بارگذاری اعلان‌ها ناموفق بود",
    notificationUpdateFailed: "به‌روزرسانی اعلان ناموفق بود",
    notificationDeleteFailed: "حذف اعلان ناموفق بود",
    orderAcceptFailed: "قبول سفارش ناموفق بود (شاید قبلاً گرفته شده)",
    financeLoadFailed: "بارگذاری مالی ناموفق بود",
    riderRegisterFailed: "ثبت پیک ناموفق بود",
    riderApproveFailed: "تأیید پیک ناموفق بود",
    riderCivilIdInvalid: "شماره مدنی نامعتبر است (باید ۸ تا ۱۴ رقم باشد)",
    riderRevokeFailed: "لغو دسترسی پیک ناموفق بود",
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
    aiImageFailed: "بهبود تصویر ناموفق بود",
    aiDescriptionFailed: "تولید توضیحات ناموفق بود",
    smartProductFailed: "ثبت هوشمند محصول ناموفق بود",
    smartProductNoImages: "هیچ تصویری برای پردازش وجود ندارد",
    storeLoadFailed: "بارگذاری فروشگاه ناموفق بود",
    coverageSaveFailed: "ذخیره محدوده پوشش ناموفق بود",
    reviewsLoadFailed: "بارگذاری نظرات ناموفق بود",
    reviewCreateFailed: "ثبت نظر ناموفق بود",
    reviewAlreadyExists: "شما قبلاً برای این محصول نظر ثبت کرده‌اید",
    reviewDeleteFailed: "حذف نظر ناموفق بود",
    questionsLoadFailed: "بارگذاری سوالات ناموفق بود",
    questionCreateFailed: "ثبت سوال ناموفق بود",
    questionAnswerFailed: "ثبت پاسخ ناموفق بود",
    questionDeleteFailed: "حذف سوال ناموفق بود",
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
      riders: "پیک‌ها",
      smartProduct: "ثبت هوشمند",
      reviews: "نظرات مشتریان",
      questions: "پرسش و پاسخ",
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
      skuPlaceholder: "کد کالا (SKU) — اختیاری",
      variantOfLabel: "سایز دیگری از",
      noVariantParent: "محصول مستقل (بدون سایز دیگر)",
      variantLabelPlaceholder: "برچسب سایز، مثلاً «۷۵۰ گرم»",
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
      aiImage: "بهبود تصویر",
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
      webSourced: "یافت‌شده از اینترنت ({source}) — بررسی کنید که دقیقاً همین محصول است",
      aiGenerated: "تصویر تولیدشده با AI — بررسی کنید که با محصول واقعی مطابقت دارد",
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
      uploadLogo: "بارگذاری لوگو",
      removeLogo: "حذف لوگو",
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
    reviews: {
      title: "نظرات مشتریان",
      subtitle: "مدیریت نظرات ثبت‌شده روی محصولات",
      empty: "هنوز نظری ثبت نشده است.",
      delete: "حذف نظر",
      byLabel: "توسط {name}",
    },
    questions: {
      title: "پرسش و پاسخ",
      subtitle: "پاسخ به سوالات مشتریان درباره محصولات",
      empty: "هنوز سوالی ثبت نشده است.",
      answer: "پاسخ دادن",
      delete: "حذف سوال",
      answerModalTitle: "پاسخ به سوال",
      answerPlaceholder: "پاسخ خود را بنویسید...",
      submitAnswer: "ثبت پاسخ",
      awaitingBadge: "در انتظار پاسخ",
      answeredBadge: "پاسخ داده شده",
      askedByLabel: "پرسیده شده توسط {name}",
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
      textSection: "متن بنر (به تفکیک زبان)",
      textLangHint: "متن هر زبان را جداگانه وارد کنید. اگر زبانی خالی بماند، از متن فارسی استفاده می‌شود.",
      badgePlaceholder: "برچسب (مثلاً پیشنهاد ویژه)",
      titlePlaceholder: "عنوان بنر",
      subtitlePlaceholder: "زیرعنوان",
      ctaLabelPlaceholder: "متن دکمه",
      ctaHrefPlaceholder: "لینک دکمه (مثلاً /categories)",
      imageUrlPlaceholder: "آدرس تصویر بنر",
      imageRtlLabel: "تصویر راست‌به‌چپ (فارسی و عربی)",
      imageLtrLabel: "تصویر چپ‌به‌راست (انگلیسی)",
      imageLtrHint: "اختیاری؛ در فروشگاه انگلیسی استفاده می‌شود. اگر خالی بماند، همان تصویر اصلی نمایش داده می‌شود.",
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
      bannerHint: "اختیاری — فقط برای مدیریت کمپین. بنرهای اسلایدر صفحه اصلی از بخش «بنرها» تنظیم می‌شوند.",
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
      subtitle: "وضعیت را مرحله‌به‌مرحله جلو ببرید؛ بعد از آماده‌سازی می‌توانید پیک تخصیص دهید.",
      loading: "بارگذاری…",
      empty: "سفارشی یافت نشد.",
      orderPrefix: "سفارش",
      riderPlaceholder: "انتخاب پیک",
      riderLabel: "پیک",
      assignRider: "تخصیص پیک و ارسال",
      assignAfterPreparing: "ابتدا وضعیت را به «آماده‌سازی» برسانید؛ سپس پیک را انتخاب و تخصیص دهید.",
      assignedRider: "پیک فعلی",
      statusLabel: "وضعیت سفارش",
      statusHint: "ترتیب پیشنهادی: در انتظار → تأیید → آماده‌سازی → تخصیص پیک → ارسال → تحویل",
      customer: "مشتری",
      payment: "پرداخت",
      printInvoice: "چاپ فاکتور",
      pickedUpAt: "دریافت از فروشگاه",
      viewDeliveryProof: "مشاهده عکس تحویل",
      failedDeliveryTitle: "عدم تحویل",
      failedDeliveryNote: "توضیحات پیک",
      viewFailPhoto: "مشاهده عکس",
      failReason: {
        customer_absent: "عدم حضور در محل",
        no_answer: "عدم پاسخگویی به تماس",
        wrong_address: "آدرس نادرست یا ناقص",
        customer_refused: "انصراف مشتری",
        other: "موارد دیگر",
      },
      status: {
        pending: "در انتظار",
        confirmed: "تأیید",
        preparing: "آماده‌سازی",
        out_for_delivery: "ارسال",
        delivered: "تحویل",
        cancelled: "لغو",
      },
    },
    receiptSettings: {
      title: "اطلاعات فاکتور فروشگاه",
      desc: "این اطلاعات روی فاکتوری که همراه سفارش برای مشتری ارسال می‌شود چاپ می‌شود.",
      storeName: "نام فروشگاه",
      storeAddress: "آدرس فروشگاه",
      storePhone: "شماره تماس",
      footer: "متن پایانی فاکتور",
      langHint: "برای هر زبان جداگانه وارد کنید.",
      save: "ذخیره",
    },
    notifCenter: {
      title: "اعلان‌ها",
      empty: "اعلانی نیست",
      markAllRead: "همه را خواندم",
      clearRead: "پاک کردن خوانده‌شده‌ها",
      newOrderToast: "سفارش جدید",
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
    riders: {
      title: "مدیریت پیک‌ها",
      subtitle: "ثبت پیک جدید یا تأیید مشتریان برای نقش پیک",
      registerTitle: "ثبت‌نام پیک",
      registerHint:
        "اطلاعات کامل هویت پیک را وارد کنید؛ بعداً با OTP وارد پنل پیک می‌شود.",
      register: "ثبت پیک",
      firstName: "نام",
      lastName: "نام خانوادگی",
      civilId: "شماره مدنی (رقم مدني)",
      civilIdPlaceholder: "مثلاً ۱۲۳۴۵۶۷۸",
      civilIdHint: "معادل کد ملی در عمان — Civil Number روی کارت شناسایی",
      phone: "شماره تماس",
      phonePlaceholder: "مثلاً +9689xxxxxxx",
      address: "آدرس",
      addressPlaceholder: "آدرس محل سکونت یا محل کار پیک",
      approveFormHint: "قبل از تأیید، همه فیلدهای هویت پیک الزامی است.",
      listTitle: "پیک‌های فعال",
      entityName: "پیک‌ها",
      colName: "نام",
      colCivilId: "شماره مدنی",
      colPhone: "تلفن",
      colAddress: "آدرس",
      colJoined: "عضویت",
      colActions: "عملیات",
      revoke: "لغو نقش پیک",
      approveTitle: "تأیید از بین مشتریان",
      approveHint: "مشتریانی که قبلاً وارد شده‌اند را می‌توانید به پیک تبدیل کنید.",
      approveEmpty: "مشتری قابل تأییدی نیست.",
      approve: "تأیید به‌عنوان پیک",
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
    productExtrasToggle: {
      title: "تب‌ها و خرید همزمان در صفحه محصول",
      onDesc: "مشخصات، نظرات، سوالات، محصولات مشابه و خرید همزمان نمایش داده می‌شود",
      offDesc: "این بخش‌ها در صفحه جزئیات محصول مخفی هستند",
      on: "جزئیات: روشن",
      off: "جزئیات: خاموش",
    },
    cashSurcharge: {
      title: "هزینه پرداخت در محل",
      desc: "اگر مشتری هنگام تسویه «پرداخت در محل» را انتخاب کند، این مبلغ به جمع کل فاکتور اضافه می‌شود. مقدار صفر یعنی بدون هزینه اضافه.",
      label: "مبلغ اضافه",
      save: "ذخیره",
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
  rider: {
    panelLabel: "پنل پیک",
    loginTitle: "ورود پیک",
    loginSubtitle: "با شماره موبایل و کد یکبارمصرف وارد شوید",
    ordersTitle: "سفارش‌های پیک",
    financeTitle: "مدیریت مالی",
    readyTitle: "آماده تحویل (بدون پیک)",
    readyEmpty: "سفارش آماده‌ای در صف نیست",
    activeTitle: "سفارش‌های تخصیص‌شده به من",
    activeHint: "سفارش‌هایی که ادمین به شما داده یا خودتان قبول کرده‌اید — وضعیت تحویل را مشخص کنید.",
    activeEmpty: "سفارش فعالی برای تحویل ندارید",
    recentTitle: "تاریخچه تحویل‌شده",
    historyEmpty: "هنوز سفارشی تحویل نداده‌اید",
    accept: "قبول سفارش",
    markPickedUp: "دریافت از فروشگاه",
    pickupHint: "پس از تحویل گرفتن سفارش از فروشگاه، این گزینه را بزنید.",
    pickedUpAt: "دریافت‌شده از فروشگاه: {time}",
    markDelivered: "تحویل به مشتری",
    markUndelivered: "عدم تحویل",
    proof: {
      deliveredTitle: "ثبت تحویل به مشتری",
      deliveredDescription: "یک عکس از تحویل سفارش بگیرید و آپلود کنید.",
      takePhoto: "گرفتن عکس",
      retakePhoto: "گرفتن عکس دوباره",
      photoRequired: "برای ثبت تحویل، گرفتن عکس الزامی است.",
      uploading: "در حال آپلود عکس…",
      confirmDelivered: "تأیید تحویل",
    },
    undelivered: {
      title: "ثبت عدم تحویل",
      description: "دلیل عدم تحویل را انتخاب کنید و یک عکس بگیرید.",
      reasonLabel: "دلیل عدم تحویل",
      reasons: {
        customer_absent: "عدم حضور در محل",
        no_answer: "عدم پاسخگویی به تماس",
        wrong_address: "آدرس نادرست یا ناقص",
        customer_refused: "انصراف مشتری",
        other: "موارد دیگر",
      },
      noteLabel: "توضیحات",
      notePlaceholder: "توضیح کوتاهی درباره دلیل عدم تحویل بنویسید",
      noteRequired: "برای «موارد دیگر» نوشتن توضیحات الزامی است.",
      photoLabel: "عکس محل / وضعیت تحویل",
      submit: "ثبت عدم تحویل",
    },
    tabs: {
      assigned: "تخصیص‌شده",
      ready: "آماده",
      history: "تاریخچه",
    },
    nav: { orders: "سفارش‌ها", finance: "مالی" },
    finance: {
      deliveredCount: "تعداد تحویل",
      totalSales: "جمع مبلغ سفارش‌ها",
      deliveryFees: "جمع هزینه ارسال",
      cashCollected: "نقدی وصول‌شده",
      hint: "فقط سفارش‌های تحویل‌شدهٔ همین حساب پیک محاسبه می‌شوند.",
    },
  },
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
    menu: "القائمة",
    searchShortcut: "بحث",
    trackOrder: "تتبع الطلب",
    help: "مساعدة",
    accountSignIn: "الحساب / تسجيل الدخول",
    signIn: "تسجيل الدخول",
  },
  home: {
    deliverTo: "التوصيل إلى",
    locationSample: "مسقط، الخوض",
    outOfServiceAreaTitle: "هذه المنطقة غير مغطاة بعد",
    outOfServiceArea: "لا نقدّم خدمة التوصيل إلى {area} حاليًا. يعمل فريقنا على توسيع نطاق التغطية بسرعة، وستُضاف منطقتك إلى خدماتنا قريبًا. شكرًا لتفهّمك وصبرك.",
    outOfServiceAreaAck: "حسنًا، فهمت",
    comingSoonTag: "قريبًا",
    deliverAreaMuscatKhoudh: "مسقط، الخوض",
    deliverAreaMuscatGhubra: "مسقط، الغبرة",
    deliverAreaSeeb: "السيب",
    deliverAreaSohar: "صحار",
    deliverAreaSalalah: "صلالة",
    deliverAreaNizwa: "نزوى",
    searchPlaceholder: "البحث عن منتج…",
    heroBadge: "تسوق يومي",
    heroTitle: "كل ما يحتاجه مطبخك",
    heroSubtitle: "اطلب الآن واستلم إلى باب منزلك في نفس اليوم",
    heroCta: "اطلب الآن",
    heroSlide2Badge: "عروض الأسبوع",
    heroSlide2Title: "خضار وفواكه طازجة بأقل سعر",
    heroSlide2Subtitle: "خصم حتى 25٪ على منتجات مختارة هذا الأسبوع",
    heroSlide3Badge: "توصيل مجاني",
    heroSlide3Title: "أول طلب لك علينا",
    heroSlide3Subtitle: "توصيل مجاني للطلبات فوق ١٠ ريالات عمانية",
    heroCarouselLabel: "بانرات المتجر",
    heroPrev: "الشريحة السابقة",
    heroNext: "الشريحة التالية",
    heroGoToSlide: "الانتقال إلى الشريحة {n}",
    campaignPercentOff: "خصم {value}٪",
    campaignFixedOff: "خصم {value} ر.ع.",
    flashDeals: "عروض لحظية",
    flashEnds: "ينتهي: ٠٢:٤٥:١٨",
    flashEndsIn: "ينتهي خلال",
    flashHrsLabel: "ساعة",
    flashMinLabel: "دقيقة",
    flashSecLabel: "ثانية",
    flashDaysLabel: "يوم",
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
    filtersTitle: "التصفية",
    resetAll: "إعادة ضبط الكل",
    clear: "مسح",
    showResults: "عرض {count} نتيجة",
    collectionsLabel: "المجموعات",
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
    atAGlance: "نظرة سريعة",
    similarProducts: "منتجات مشابهة",
    noSimilarProducts: "لا توجد منتجات مشابهة.",
    freeDeliveryOver: "توصيل مجاني للطلبات فوق {amount}",
    breadcrumbHome: "الرئيسية",
    sku: "رمز المنتج: {sku}",
    size: "الحجم",
    reviewsTab: "التقييمات ({count})",
    questionsTab: "الأسئلة ({count})",
    writeReview: "إضافة تقييم",
    yourRating: "تقييمك",
    reviewPlaceholder: "اكتب رأيك في هذا المنتج...",
    submitReview: "إرسال التقييم",
    signInToReview: "سجّل الدخول لإضافة تقييم",
    noReviewsYet: "لا توجد تقييمات بعد.",
    reviewsCount: "{average} · {count} تقييم",
    anonymousReviewer: "عميل",
    askQuestion: "اطرح سؤالاً",
    questionPlaceholder: "اكتب سؤالك عن هذا المنتج...",
    submitQuestion: "إرسال السؤال",
    signInToAsk: "سجّل الدخول لطرح سؤال",
    noQuestionsYet: "لا توجد أسئلة بعد.",
    awaitingAnswer: "بانتظار رد المتجر",
    storeAnswer: "رد المتجر",
    questionsCount: "{count} سؤال",
    buyNow: "الشراء الآن — {price}",
    deliveryServiceTitle: "التوصيل والخدمة",
    sameDayDelivery: "توصيل في نفس اليوم",
    sameDayDeliveryNote: "اطلب قبل الساعة 4 مساءً · التسليم 8–10 مساءً",
    easyReturns: "إرجاع سهل",
    easyReturnsNote: "أرجع عند التسليم إذا كان تالفاً",
    pickupInStore: "استلام من المتجر",
    pickupInStoreNote: "جاهز خلال ساعتين · فرع الخوض",
    frequentlyBoughtTogether: "غالباً ما تُشترى معاً",
    seeAll: "عرض الكل",
    removeFromCart: "إزالة من السلة",
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
    cashFee: "رسوم الدفع عند الاستلام",
    total: "الإجمالي",
    submitOrder: "تأكيد الطلب — {price}",
  },
  addressGate: {
    title: "حدد عنوان التوصيل الخاص بك",
    description: "لإتمام الطلب، يجب أن يكون عنوانك ضمن نطاق التوصيل الخاص بنا. الرجاء تحديد موقعك على الخريطة.",
    later: "لاحقًا",
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
    installDesc: "ثبّت المتجر على هاتفك للوصول السريع مثل تطبيق حقيقي.",
    dismiss: "لاحقاً",
    gotIt: "حسناً",
    iosHint:
      "في Safari اضغط مشاركة ثم اختر Add to Home Screen لتثبيته كتطبيق.",
    iosShare: "Share → Add to Home Screen",
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
    signInToContinue: "لعرض هذه الصفحة، يرجى تسجيل الدخول أولاً",
    phonePlaceholder: "٠٩١٢٣٤٥٦٧٨٩",
    getCode: "استلام الرمز",
    otpPlaceholder: "رمز ٦ أرقام",
    confirm: "تأكيد",
    ordersLabel: "الطلبات",
    addressesLabel: "العناوين",
    favouritesLabel: "المفضلة",
    deliveryAddresses: "عناوين التوصيل",
    favourites: "المفضلة",
    language: "اللغة",
    theme: "المظهر",
    addressesTitle: "عناويني",
    favouritesTitle: "مفضلتي",
    noAddressesYet: "لم تُضِف أي عنوان بعد.",
    noFavouritesYet: "لم تُضِف أي شيء إلى المفضلة بعد.",
    setDefault: "تعيين كافتراضي",
    defaultBadge: "افتراضي",
    addNewAddress: "إضافة عنوان جديد",
    changeAvatar: "تغيير الصورة",
    removeAvatar: "حذف الصورة",
    avatarHint: "لأفضل جودة، اختر صورة مربعة",
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
      onTheWay: "طلبك في الطريق",
      orderDetails: "تفاصيل الطلب",
      itemCount: "{count} عناصر",
      callDriver: "اتصل بالسائق",
      contactRider: "اتصل بالسائق",
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
  receipt: {
    invoiceTitle: "فاتورة بيع",
    orderNo: "رقم الطلب",
    date: "التاريخ",
    customer: "العميل",
    phone: "الهاتف",
    address: "عنوان التسليم",
    deliverySlot: "وقت التسليم",
    payment: "الدفع",
    paid: "مدفوع",
    unpaid: "غير مدفوع",
    item: "الصنف",
    qty: "الكمية",
    lineTotal: "المبلغ",
    subtotal: "إجمالي الأصناف",
    deliveryAndVat: "التوصيل والضريبة",
    cashFee: "رسوم الدفع عند الاستلام",
    total: "المبلغ المستحق",
    print: "طباعة الفاتورة",
    printSize: "حجم الورق",
    loading: "جاري تحميل الفاتورة…",
    notFound: "الطلب غير موجود",
    printedAt: "طُبعت في",
    thankYou: "شكراً لتسوقكم معنا",
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
    productExtrasShown: "يظهر قسم تفاصيل المنتج (التبويبات والمنتجات المقترنة)",
    productExtrasHidden: "تم إخفاء قسم تفاصيل المنتج (التبويبات والمنتجات المقترنة)",
    cashSurchargeSaved: "تم حفظ رسوم الدفع عند الاستلام",
    receiptSettingsSaved: "تم حفظ إعدادات الفاتورة",
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
    avatarUpdated: "تم تحديث صورة الملف الشخصي",
    avatarRemoved: "تم حذف صورة الملف الشخصي",
    orderStatusUpdated: "تم تحديث حالة الطلب",
    orderAccepted: "تم قبول الطلب",
    orderPickedUp: "تم تسجيل الاستلام من المتجر",
    orderDelivered: "تم تسجيل التسليم",
    orderReturned: "أُعيد الطلب إلى قائمة الجاهز",
    riderRegistered: "تم تسجيل السائق",
    riderApproved: "تم اعتماد السائق",
    riderRevoked: "تم إلغاء صلاحية السائق",
  },
  errors: {
    operationFailed: "فشلت العملية",
    unexpectedError: "خطأ غير متوقع",
    networkError: "تعذّر الاتصال بالخادم. تحقق من اتصال الإنترنت وحاول مرة أخرى.",
    done: "تم",
    warning: "تحذير",
    otpSendFailed: "فشل إرسال رمز التحقق",
    loginFailed: "فشل تسجيل الدخول",
    invalidOtp: "رمز التحقق غير صالح",
    adminForbidden: "هذا الحساب لا يملك صلاحية الإدارة",
    riderForbidden: "هذا الحساب لا يملك صلاحية السائق",
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
    avatarUploadFailed: "فشل رفع صورة الملف الشخصي",
    avatarRemoveFailed: "فشل حذف صورة الملف الشخصي",
    avatarRequired: "يرجى اختيار صورة",
    avatarInvalidType: "صيغة الصورة غير مدعومة",
    avatarTooLarge: "يجب ألا يتجاوز حجم الصورة ٨ ميغابايت",
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
    riderAssignNotReady: "يمكن تعيين السائق فقط للطلبات في حالة التحضير",
    ridersLoadFailed: "فشل تحميل السائقين",
    statusUpdateFailed: "فشل تحديث الحالة",
    notificationsLoadFailed: "فشل تحميل الإشعارات",
    notificationUpdateFailed: "فشل تحديث الإشعار",
    notificationDeleteFailed: "فشل حذف الإشعار",
    orderAcceptFailed: "فشل قبول الطلب (ربما سبق استلامه)",
    financeLoadFailed: "فشل تحميل البيانات المالية",
    riderRegisterFailed: "فشل تسجيل السائق",
    riderApproveFailed: "فشل اعتماد السائق",
    riderCivilIdInvalid: "الرقم المدني غير صالح (يجب أن يكون من ٨ إلى ١٤ رقماً)",
    riderRevokeFailed: "فشل إلغاء صلاحية السائق",
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
    aiImageFailed: "فشل تحسين الصورة",
    aiDescriptionFailed: "فشل إنشاء الوصف",
    smartProductFailed: "فشل التسجيل الذكي للمنتج",
    smartProductNoImages: "لا توجد صور للمعالجة",
    storeLoadFailed: "فشل تحميل المتجر",
    coverageSaveFailed: "فشل حفظ نطاق التغطية",
    reviewsLoadFailed: "فشل تحميل التقييمات",
    reviewCreateFailed: "فشل إرسال التقييم",
    reviewAlreadyExists: "لقد قمت بتقييم هذا المنتج من قبل",
    reviewDeleteFailed: "فشل حذف التقييم",
    questionsLoadFailed: "فشل تحميل الأسئلة",
    questionCreateFailed: "فشل إرسال السؤال",
    questionAnswerFailed: "فشل إرسال الإجابة",
    questionDeleteFailed: "فشل حذف السؤال",
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
      riders: "السائقون",
      smartProduct: "تسجيل ذكي",
      reviews: "تقييمات العملاء",
      questions: "الأسئلة والأجوبة",
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
      skuPlaceholder: "رمز المنتج (SKU) — اختياري",
      variantOfLabel: "حجم آخر من",
      noVariantParent: "منتج مستقل (بدون أحجام أخرى)",
      variantLabelPlaceholder: "تسمية الحجم، مثل «750 غ»",
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
      aiImage: "تحسين الصورة",
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
      webSourced: "تم العثور عليها على الإنترنت ({source}) — تحقق من أنها نفس المنتج تمامًا",
      aiGenerated: "صورة تم إنشاؤها بالذكاء الاصطناعي — تحقق من مطابقتها للمنتج الحقيقي",
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
      uploadLogo: "رفع الشعار",
      removeLogo: "إزالة الشعار",
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
    reviews: {
      title: "تقييمات العملاء",
      subtitle: "إدارة التقييمات المضافة على المنتجات",
      empty: "لا توجد تقييمات بعد.",
      delete: "حذف التقييم",
      byLabel: "بواسطة {name}",
    },
    questions: {
      title: "الأسئلة والأجوبة",
      subtitle: "الرد على أسئلة العملاء حول المنتجات",
      empty: "لا توجد أسئلة بعد.",
      answer: "الرد",
      delete: "حذف السؤال",
      answerModalTitle: "الرد على السؤال",
      answerPlaceholder: "اكتب ردك...",
      submitAnswer: "إرسال الرد",
      awaitingBadge: "بانتظار الرد",
      answeredBadge: "تم الرد",
      askedByLabel: "سأل {name}",
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
      textSection: "نص البانر (لكل لغة)",
      textLangHint: "أدخل نص كل لغة على حدة. إذا تُركت لغة فارغة، يُستخدم النص الفارسي.",
      badgePlaceholder: "الشارة (مثلاً عرض خاص)",
      titlePlaceholder: "عنوان البانر",
      subtitlePlaceholder: "العنوان الفرعي",
      ctaLabelPlaceholder: "نص الزر",
      ctaHrefPlaceholder: "رابط الزر (مثلاً /categories)",
      imageUrlPlaceholder: "رابط صورة البانر",
      imageRtlLabel: "صورة من اليمين إلى اليسار (العربية والفارسية)",
      imageLtrLabel: "صورة من اليسار إلى اليمين (الإنجليزية)",
      imageLtrHint: "اختياري؛ تُستخدم في المتجر الإنجليزي. إن تُركت فارغة تُعرض الصورة الرئيسية نفسها.",
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
      bannerHint: "اختياري — للإدارة فقط. بانرات الصفحة الرئيسية تُدار من قسم «البانرات».",
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
      subtitle: "حدّث الحالة خطوة بخطوة؛ بعد التحضير يمكنك تعيين سائق.",
      loading: "جاري التحميل…",
      empty: "لا توجد طلبات.",
      orderPrefix: "طلب",
      riderPlaceholder: "اختر السائق",
      riderLabel: "السائق",
      assignRider: "تعيين السائق والإرسال",
      assignAfterPreparing: "أولاً انقل الحالة إلى «قيد التحضير»، ثم اختر السائق وعيّنه.",
      assignedRider: "السائق الحالي",
      statusLabel: "حالة الطلب",
      statusHint: "الترتيب المقترح: انتظار → تأكيد → تحضير → تعيين سائق → إرسال → تسليم",
      customer: "العميل",
      payment: "الدفع",
      printInvoice: "طباعة الفاتورة",
      pickedUpAt: "الاستلام من المتجر",
      viewDeliveryProof: "عرض صورة التسليم",
      failedDeliveryTitle: "تعذّر التسليم",
      failedDeliveryNote: "ملاحظات السائق",
      viewFailPhoto: "عرض الصورة",
      failReason: {
        customer_absent: "عدم التواجد في الموقع",
        no_answer: "عدم الرد على الاتصال",
        wrong_address: "عنوان خاطئ أو غير مكتمل",
        customer_refused: "تراجع العميل",
        other: "أسباب أخرى",
      },
      status: {
        pending: "قيد الانتظار",
        confirmed: "مؤكد",
        preparing: "قيد التحضير",
        out_for_delivery: "في الطريق",
        delivered: "تم التسليم",
        cancelled: "ملغى",
      },
    },
    receiptSettings: {
      title: "بيانات فاتورة المتجر",
      desc: "تُطبع هذه البيانات على الفاتورة المرسلة مع الطلب إلى العميل.",
      storeName: "اسم المتجر",
      storeAddress: "عنوان المتجر",
      storePhone: "رقم الاتصال",
      footer: "نص تذييل الفاتورة",
      langHint: "أدخل القيمة لكل لغة على حدة.",
      save: "حفظ",
    },
    notifCenter: {
      title: "الإشعارات",
      empty: "لا توجد إشعارات",
      markAllRead: "تعليم الكل كمقروء",
      clearRead: "حذف المقروءة",
      newOrderToast: "طلب جديد",
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
    riders: {
      title: "إدارة السائقين",
      subtitle: "تسجيل سائق جديد أو اعتماد العملاء كسائقين",
      registerTitle: "تسجيل سائق",
      registerHint:
        "أدخل بيانات هوية السائق كاملة؛ سيدخل لاحقاً بلوحة السائق عبر رمز التحقق.",
      register: "تسجيل السائق",
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      civilId: "الرقم المدني",
      civilIdPlaceholder: "مثال: 12345678",
      civilIdHint: "رقم الهوية المدنية في عُمان (Civil Number)",
      phone: "رقم الاتصال",
      phonePlaceholder: "مثال: +9689xxxxxxx",
      address: "العنوان",
      addressPlaceholder: "عنوان السكن أو العمل",
      approveFormHint: "جميع حقول هوية السائق مطلوبة قبل الاعتماد.",
      listTitle: "السائقون النشطون",
      entityName: "السائقون",
      colName: "الاسم",
      colCivilId: "الرقم المدني",
      colPhone: "الهاتف",
      colAddress: "العنوان",
      colJoined: "الانضمام",
      colActions: "إجراءات",
      revoke: "إلغاء دور السائق",
      approveTitle: "الاعتماد من العملاء",
      approveHint: "يمكن تحويل العملاء المسجّلين مسبقاً إلى سائقين.",
      approveEmpty: "لا يوجد عملاء لل اعتماد.",
      approve: "اعتماد كسائق",
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
    productExtrasToggle: {
      title: "التبويبات والمنتجات المقترنة في صفحة المنتج",
      onDesc: "تظهر المواصفات والتقييمات والأسئلة والمنتجات المشابهة والمقترنة",
      offDesc: "هذه الأقسام مخفية في صفحة تفاصيل المنتج",
      on: "التفاصيل: تشغيل",
      off: "التفاصيل: إيقاف",
    },
    cashSurcharge: {
      title: "رسوم الدفع عند الاستلام",
      desc: "عند اختيار العميل «الدفع عند الاستلام» أثناء إتمام الشراء، يُضاف هذا المبلغ إلى إجمالي الفاتورة. القيمة صفر تعني بدون رسوم إضافية.",
      label: "المبلغ الإضافي",
      save: "حفظ",
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
  rider: {
    panelLabel: "لوحة السائق",
    loginTitle: "دخول السائق",
    loginSubtitle: "سجّل الدخول برقم الجوال ورمز التحقق",
    ordersTitle: "طلبات السائق",
    financeTitle: "الإدارة المالية",
    readyTitle: "جاهز للتسليم (بدون سائق)",
    readyEmpty: "لا توجد طلبات جاهزة في القائمة",
    activeTitle: "الطلبات المعيّنة لي",
    activeHint: "الطلبات التي عيّنها المشرف أو قبلتها — حدّد حالة التسليم.",
    activeEmpty: "لا توجد طلبات نشطة للتسليم",
    recentTitle: "سجل التسليمات",
    historyEmpty: "لم تُسلّم أي طلبات بعد",
    accept: "قبول الطلب",
    markPickedUp: "الاستلام من المتجر",
    pickupHint: "اضغط هنا بعد استلام الطلب من المتجر.",
    pickedUpAt: "تم الاستلام من المتجر: {time}",
    markDelivered: "التسليم إلى العميل",
    markUndelivered: "تعذّر التسليم",
    proof: {
      deliveredTitle: "تأكيد التسليم إلى العميل",
      deliveredDescription: "التقط صورة لتسليم الطلب وارفعها.",
      takePhoto: "التقاط صورة",
      retakePhoto: "إعادة التقاط الصورة",
      photoRequired: "التقاط صورة إلزامي لتأكيد التسليم.",
      uploading: "جارٍ رفع الصورة…",
      confirmDelivered: "تأكيد التسليم",
    },
    undelivered: {
      title: "تسجيل تعذّر التسليم",
      description: "اختر سبب تعذّر التسليم والتقط صورة.",
      reasonLabel: "سبب تعذّر التسليم",
      reasons: {
        customer_absent: "عدم التواجد في الموقع",
        no_answer: "عدم الرد على الاتصال",
        wrong_address: "عنوان خاطئ أو غير مكتمل",
        customer_refused: "تراجع العميل",
        other: "أسباب أخرى",
      },
      noteLabel: "ملاحظات",
      notePlaceholder: "اكتب وصفًا موجزًا لسبب تعذّر التسليم",
      noteRequired: "كتابة الملاحظات إلزامية عند اختيار «أسباب أخرى».",
      photoLabel: "صورة الموقع / حالة التسليم",
      submit: "تسجيل تعذّر التسليم",
    },
    tabs: {
      assigned: "معيّنة",
      ready: "جاهزة",
      history: "السجل",
    },
    nav: { orders: "الطلبات", finance: "المالية" },
    finance: {
      deliveredCount: "عدد التسليمات",
      totalSales: "إجمالي مبالغ الطلبات",
      deliveryFees: "إجمالي رسوم التوصيل",
      cashCollected: "النقد المحصّل",
      hint: "تُحسب فقط الطلبات المسلّمة لهذا السائق.",
    },
  },
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
    menu: "Menu",
    searchShortcut: "Search",
    trackOrder: "Track order",
    help: "Help",
    accountSignIn: "Account / Sign in",
    signIn: "Sign in",
  },
  home: {
    deliverTo: "Deliver to",
    locationSample: "Muscat, Al Khoudh",
    outOfServiceAreaTitle: "We don't cover this area yet",
    outOfServiceArea: "We currently don't deliver to {area}. Our team is expanding our coverage quickly, and we'll be serving your area soon. Thank you for your patience.",
    outOfServiceAreaAck: "Got it",
    comingSoonTag: "Coming soon",
    deliverAreaMuscatKhoudh: "Muscat, Al Khoudh",
    deliverAreaMuscatGhubra: "Muscat, Al Ghubra",
    deliverAreaSeeb: "Seeb",
    deliverAreaSohar: "Sohar",
    deliverAreaSalalah: "Salalah",
    deliverAreaNizwa: "Nizwa",
    searchPlaceholder: "Search products…",
    heroBadge: "Everyday grocery",
    heroTitle: "Everything your kitchen needs",
    heroSubtitle: "Order now, delivered to your door the same day",
    heroCta: "Shop now",
    heroSlide2Badge: "Deals of the week",
    heroSlide2Title: "Fresh produce for less",
    heroSlide2Subtitle: "Up to 25% off hand-picked items this week",
    heroSlide3Badge: "Free delivery",
    heroSlide3Title: "Your first order is on us",
    heroSlide3Subtitle: "Free delivery on orders over 10 OMR",
    heroCarouselLabel: "Store banners",
    heroPrev: "Previous slide",
    heroNext: "Next slide",
    heroGoToSlide: "Go to slide {n}",
    campaignPercentOff: "{value}% off",
    campaignFixedOff: "{value} OMR off",
    flashDeals: "Flash Deals",
    flashEnds: "Ends: 02:45:18",
    flashEndsIn: "Ends in",
    flashHrsLabel: "Hrs",
    flashMinLabel: "Min",
    flashSecLabel: "Sec",
    flashDaysLabel: "Days",
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
    filtersTitle: "Filters",
    resetAll: "Reset all",
    clear: "Clear",
    showResults: "Show {count} results",
    collectionsLabel: "Collections",
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
    atAGlance: "At a glance",
    similarProducts: "Similar products",
    noSimilarProducts: "No similar products found.",
    freeDeliveryOver: "Free delivery over {amount}",
    breadcrumbHome: "Home",
    sku: "SKU: {sku}",
    size: "Size",
    reviewsTab: "Reviews ({count})",
    questionsTab: "Questions ({count})",
    writeReview: "Write a review",
    yourRating: "Your rating",
    reviewPlaceholder: "Share your thoughts about this product...",
    submitReview: "Submit review",
    signInToReview: "Sign in to write a review",
    noReviewsYet: "No reviews yet.",
    reviewsCount: "{average} · {count} ratings",
    anonymousReviewer: "Customer",
    askQuestion: "Ask a question",
    questionPlaceholder: "Ask a question about this product...",
    submitQuestion: "Submit question",
    signInToAsk: "Sign in to ask a question",
    noQuestionsYet: "No questions yet.",
    awaitingAnswer: "Awaiting an answer from the store",
    storeAnswer: "Store answer",
    questionsCount: "{count} questions",
    buyNow: "Buy now — {price}",
    deliveryServiceTitle: "Delivery & Service",
    sameDayDelivery: "Same-day delivery",
    sameDayDeliveryNote: "Order before 4 PM · 8–10 PM slot",
    easyReturns: "Easy returns",
    easyReturnsNote: "Return on delivery if damaged",
    pickupInStore: "Pick up in store",
    pickupInStoreNote: "Ready in 2 hours · Al Khoudh branch",
    frequentlyBoughtTogether: "Frequently bought together",
    seeAll: "See all",
    removeFromCart: "Remove from cart",
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
    cashFee: "Cash on delivery fee",
    total: "Total",
    submitOrder: "Place order — {price}",
  },
  addressGate: {
    title: "Set your delivery address",
    description: "To place an order, your address must be inside our delivery coverage area. Please pick your location on the map.",
    later: "Later",
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
    installDesc: "Install the store on your phone for faster access like a real app.",
    dismiss: "Not now",
    gotIt: "Got it",
    iosHint:
      "In Safari, tap Share and choose Add to Home Screen to install it like an app.",
    iosShare: "Share → Add to Home Screen",
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
    signInToContinue: "Please sign in first to view this page",
    phonePlaceholder: "09123456789",
    getCode: "Get code",
    otpPlaceholder: "6-digit code",
    confirm: "Confirm",
    ordersLabel: "Orders",
    addressesLabel: "Addresses",
    favouritesLabel: "Favourites",
    deliveryAddresses: "Delivery addresses",
    favourites: "Favourites",
    language: "Language",
    theme: "Theme",
    addressesTitle: "My addresses",
    favouritesTitle: "My favourites",
    noAddressesYet: "You haven't added any addresses yet.",
    noFavouritesYet: "You haven't added anything to favourites yet.",
    setDefault: "Set as default",
    defaultBadge: "Default",
    addNewAddress: "Add new address",
    changeAvatar: "Change photo",
    removeAvatar: "Remove photo",
    avatarHint: "For best results, choose a square photo",
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
      onTheWay: "Your order is on the way",
      orderDetails: "Order Details",
      itemCount: "{count} items",
      callDriver: "Call driver",
      contactRider: "Contact Rider",
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
  receipt: {
    invoiceTitle: "Sales invoice",
    orderNo: "Order no.",
    date: "Date",
    customer: "Customer",
    phone: "Phone",
    address: "Delivery address",
    deliverySlot: "Delivery slot",
    payment: "Payment",
    paid: "Paid",
    unpaid: "Unpaid",
    item: "Item",
    qty: "Qty",
    lineTotal: "Amount",
    subtotal: "Items subtotal",
    deliveryAndVat: "Delivery & VAT",
    cashFee: "Cash-on-delivery fee",
    total: "Amount due",
    print: "Print invoice",
    printSize: "Paper size",
    loading: "Loading invoice…",
    notFound: "Order not found",
    printedAt: "Printed at",
    thankYou: "Thank you for your purchase",
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
    productExtrasShown: "Product detail tabs and frequently-bought section are visible",
    productExtrasHidden: "Product detail tabs and frequently-bought section are hidden",
    cashSurchargeSaved: "Cash on delivery fee saved",
    receiptSettingsSaved: "Receipt settings saved",
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
    avatarUpdated: "Profile photo updated",
    avatarRemoved: "Profile photo removed",
    orderStatusUpdated: "Order status updated",
    orderAccepted: "Order accepted",
    orderPickedUp: "Pickup from store recorded",
    orderDelivered: "Delivery recorded",
    orderReturned: "Order returned to ready pool",
    riderRegistered: "Rider registered",
    riderApproved: "Rider approved",
    riderRevoked: "Rider access revoked",
  },
  errors: {
    operationFailed: "Operation failed",
    unexpectedError: "Unexpected error",
    networkError: "Could not reach the server. Check your internet connection and try again.",
    done: "Done",
    warning: "Warning",
    otpSendFailed: "Failed to send verification code",
    loginFailed: "Sign-in failed",
    invalidOtp: "Invalid verification code",
    adminForbidden: "This account does not have admin access",
    riderForbidden: "This account does not have rider access",
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
    avatarUploadFailed: "Failed to upload profile photo",
    avatarRemoveFailed: "Failed to remove profile photo",
    avatarRequired: "Please choose a photo",
    avatarInvalidType: "Unsupported image format",
    avatarTooLarge: "Image must be 8 MB or smaller",
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
    riderAssignNotReady: "Rider can only be assigned when the order is Preparing",
    ridersLoadFailed: "Failed to load riders",
    statusUpdateFailed: "Failed to update status",
    notificationsLoadFailed: "Failed to load notifications",
    notificationUpdateFailed: "Failed to update notification",
    notificationDeleteFailed: "Failed to delete notification",
    orderAcceptFailed: "Could not accept order (it may already be taken)",
    financeLoadFailed: "Failed to load finance summary",
    riderRegisterFailed: "Failed to register rider",
    riderApproveFailed: "Failed to approve rider",
    riderCivilIdInvalid: "Invalid Civil Number (must be 8–14 digits)",
    riderRevokeFailed: "Failed to revoke rider access",
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
    aiImageFailed: "Image enhancement failed",
    aiDescriptionFailed: "Failed to generate description",
    smartProductFailed: "Smart product listing failed",
    smartProductNoImages: "No images to process",
    storeLoadFailed: "Failed to load store",
    coverageSaveFailed: "Failed to save coverage area",
    reviewsLoadFailed: "Failed to load reviews",
    reviewCreateFailed: "Failed to submit review",
    reviewAlreadyExists: "You've already reviewed this product",
    reviewDeleteFailed: "Failed to delete review",
    questionsLoadFailed: "Failed to load questions",
    questionCreateFailed: "Failed to submit question",
    questionAnswerFailed: "Failed to submit answer",
    questionDeleteFailed: "Failed to delete question",
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
      riders: "Riders",
      smartProduct: "Smart listing",
      reviews: "Customer reviews",
      questions: "Questions & answers",
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
      skuPlaceholder: "SKU (optional)",
      variantOfLabel: "Size variant of",
      noVariantParent: "Standalone product (no other sizes)",
      variantLabelPlaceholder: "Size label, e.g. \"750 g\"",
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
      aiImage: "Enhance image",
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
      webSourced: "Found on the web ({source}) — verify this is exactly the same product",
      aiGenerated: "AI-generated image — verify it matches the real product",
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
      uploadLogo: "Upload logo",
      removeLogo: "Remove logo",
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
    reviews: {
      title: "Customer reviews",
      subtitle: "Manage reviews left on products",
      empty: "No reviews yet.",
      delete: "Delete review",
      byLabel: "by {name}",
    },
    questions: {
      title: "Questions & answers",
      subtitle: "Answer customer questions about products",
      empty: "No questions yet.",
      answer: "Answer",
      delete: "Delete question",
      answerModalTitle: "Answer the question",
      answerPlaceholder: "Write your answer...",
      submitAnswer: "Submit answer",
      awaitingBadge: "Awaiting answer",
      answeredBadge: "Answered",
      askedByLabel: "Asked by {name}",
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
      textSection: "Banner text (per language)",
      textLangHint: "Enter each language separately. A blank language falls back to the Persian text.",
      badgePlaceholder: "Badge (e.g. Special offer)",
      titlePlaceholder: "Banner title",
      subtitlePlaceholder: "Subtitle",
      ctaLabelPlaceholder: "Button label",
      ctaHrefPlaceholder: "Button link (e.g. /categories)",
      imageUrlPlaceholder: "Banner image URL",
      imageRtlLabel: "Right-to-left image (Persian & Arabic)",
      imageLtrLabel: "Left-to-right image (English)",
      imageLtrHint: "Optional — used on the English storefront. Falls back to the main image when empty.",
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
      bannerHint: "Optional — for campaign records only. Homepage carousel banners are managed under Banners.",
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
      subtitle: "Advance status step by step; assign a rider after Preparing.",
      loading: "Loading…",
      empty: "No orders found.",
      orderPrefix: "Order",
      riderPlaceholder: "Select rider",
      riderLabel: "Rider",
      assignRider: "Assign rider & ship",
      assignAfterPreparing: "First set status to Preparing, then select and assign a rider.",
      assignedRider: "Current rider",
      statusLabel: "Order status",
      statusHint: "Suggested flow: Pending → Confirmed → Preparing → Assign rider → Shipping → Delivered",
      customer: "Customer",
      payment: "Payment",
      printInvoice: "Print invoice",
      pickedUpAt: "Picked up from store",
      viewDeliveryProof: "View delivery photo",
      failedDeliveryTitle: "Failed delivery",
      failedDeliveryNote: "Rider notes",
      viewFailPhoto: "View photo",
      failReason: {
        customer_absent: "Nobody at the location",
        no_answer: "No answer on call",
        wrong_address: "Wrong or incomplete address",
        customer_refused: "Customer changed their mind",
        other: "Something else",
      },
      status: {
        pending: "Pending",
        confirmed: "Confirmed",
        preparing: "Preparing",
        out_for_delivery: "Shipping",
        delivered: "Delivered",
        cancelled: "Cancelled",
      },
    },
    receiptSettings: {
      title: "Store invoice details",
      desc: "Printed on the invoice that goes with the order to the customer.",
      storeName: "Store name",
      storeAddress: "Store address",
      storePhone: "Contact number",
      footer: "Invoice footer text",
      langHint: "Enter a value for each language.",
      save: "Save",
    },
    notifCenter: {
      title: "Notifications",
      empty: "No notifications",
      markAllRead: "Mark all read",
      clearRead: "Clear read",
      newOrderToast: "New order",
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
    riders: {
      title: "Manage riders",
      subtitle: "Register a new rider or approve customers as riders",
      registerTitle: "Register rider",
      registerHint:
        "Enter full rider identity details; they sign in later on the rider panel with OTP.",
      register: "Register rider",
      firstName: "First name",
      lastName: "Last name",
      civilId: "Civil Number",
      civilIdPlaceholder: "e.g. 12345678",
      civilIdHint: "Omani Civil Number (رقم مدني) — national ID equivalent",
      phone: "Phone",
      phonePlaceholder: "e.g. +9689xxxxxxx",
      address: "Address",
      addressPlaceholder: "Home or work address",
      approveFormHint: "All rider identity fields are required before approval.",
      listTitle: "Active riders",
      entityName: "Riders",
      colName: "Name",
      colCivilId: "Civil No.",
      colPhone: "Phone",
      colAddress: "Address",
      colJoined: "Joined",
      colActions: "Actions",
      revoke: "Revoke rider role",
      approveTitle: "Approve from customers",
      approveHint: "Promote existing signed-up customers to riders.",
      approveEmpty: "No customers available to approve.",
      approve: "Approve as rider",
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
    productExtrasToggle: {
      title: "Tabs & bought-together on product page",
      onDesc: "Specs, reviews, Q&A, similar products, and bought-together are shown",
      offDesc: "These sections are hidden on the product detail page",
      on: "Extras: on",
      off: "Extras: off",
    },
    cashSurcharge: {
      title: "Cash on delivery fee",
      desc: "When a customer chooses Cash on delivery at checkout, this amount is added to the invoice total. Zero means no extra fee.",
      label: "Surcharge",
      save: "Save",
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
  rider: {
    panelLabel: "Rider panel",
    loginTitle: "Rider sign-in",
    loginSubtitle: "Sign in with phone number and one-time code",
    ordersTitle: "Rider orders",
    financeTitle: "Finance",
    readyTitle: "Ready (unassigned)",
    readyEmpty: "No ready orders in the queue",
    activeTitle: "Assigned to me",
    activeHint: "Orders assigned by admin or accepted by you — mark delivered or not.",
    activeEmpty: "No active deliveries",
    recentTitle: "Delivery history",
    historyEmpty: "No delivered orders yet",
    accept: "Accept order",
    markPickedUp: "Picked up from store",
    pickupHint: "Tap this once you have collected the order from the store.",
    pickedUpAt: "Picked up from store: {time}",
    markDelivered: "Deliver to customer",
    markUndelivered: "Not delivered",
    proof: {
      deliveredTitle: "Confirm delivery to customer",
      deliveredDescription: "Take a photo of the hand-off and upload it.",
      takePhoto: "Take photo",
      retakePhoto: "Retake photo",
      photoRequired: "A photo is required to confirm delivery.",
      uploading: "Uploading photo…",
      confirmDelivered: "Confirm delivery",
    },
    undelivered: {
      title: "Report failed delivery",
      description: "Choose why the delivery failed and take a photo.",
      reasonLabel: "Reason",
      reasons: {
        customer_absent: "Nobody at the location",
        no_answer: "No answer on call",
        wrong_address: "Wrong or incomplete address",
        customer_refused: "Customer changed their mind",
        other: "Something else",
      },
      noteLabel: "Notes",
      notePlaceholder: "Briefly describe why the delivery failed",
      noteRequired: "Notes are required when you pick “Something else”.",
      photoLabel: "Photo of the location / delivery state",
      submit: "Report failed delivery",
    },
    tabs: {
      assigned: "Assigned",
      ready: "Ready",
      history: "History",
    },
    nav: { orders: "Orders", finance: "Finance" },
    finance: {
      deliveredCount: "Deliveries",
      totalSales: "Order totals",
      deliveryFees: "Delivery fees",
      cashCollected: "Cash collected",
      hint: "Only delivered orders for this rider account are counted.",
    },
  },
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
