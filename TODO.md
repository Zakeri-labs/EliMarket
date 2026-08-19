# SEO — Locale-in-URL Migration (Future Task)

## Current state

EliMarket storefront i18n uses a cookie (`elimarket-locale`) with three locales: **fa** (default), **ar**, and **en**. The server reads this cookie for metadata, error messages, and `html` `lang`/`dir` attributes.

## Problem for multi-language SEO

With cookie-based locale detection, every URL (e.g. `/products/apple`) serves **one** HTML document. Google typically indexes only that single version. `hreflang` tags currently point to the **same URL** for all languages, which does not give search engines distinct crawlable pages per locale.

## Recommended future work

Move locale into the URL path, for example:

- `/fa/products/[slug]`
- `/ar/products/[slug]`
- `/en/products/[slug]`

Implementation options:

1. **`next-intl`** routing integration (App Router middleware + `[locale]` segment)
2. **Next.js built-in i18n routing** (if adopted in this Next.js version)

This requires:

- Restructuring `(storefront)` routes under a `[locale]` segment
- Updating links, redirects, sitemap, and canonical URLs to include locale
- Migrating or duplicating product/category copy in the database (currently single-language names from Supabase)
- Redirect strategy for existing indexed URLs

## Scope

This is a **significant routing change** and should be scoped as its own task. Do not mix it with incremental SEO improvements (robots, sitemap, JSON-LD, OG images) already shipped in the cookie-based model.
