/** Shared layout widths for storefront — mobile-first, scales on desktop */
export const STOREFRONT_CONTAINER =
  "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

/** Cancel STOREFRONT_CONTAINER horizontal padding — edge-to-edge within the column */
export const STOREFRONT_CONTAINER_BLEED =
  "-mx-4 w-[calc(100%+2rem)] sm:-mx-6 sm:w-[calc(100%+3rem)] lg:-mx-8 lg:w-[calc(100%+4rem)]";

/** Full viewport width breakout (use inside STOREFRONT_CONTAINER) */
export const STOREFRONT_VIEWPORT_BLEED =
  "relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2";

export const STOREFRONT_PAGE = "mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8";

export const STOREFRONT_NARROW = "mx-auto w-full max-w-2xl px-4 py-4 sm:px-6 lg:px-8";
