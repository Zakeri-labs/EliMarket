import type { BlogPost } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";
import { firstFitting, humanizeSlug } from "@/lib/i18n/locale-text";

type LocalizedTriple = { fa: string | null; ar: string | null; en: string | null };

function pick(triple: LocalizedTriple, locale: Locale): string {
  return firstFitting(locale, triple[locale]) ?? "";
}

/** Post headline for the active locale — never mix in another language. */
export function resolveBlogTitle(post: BlogPost, locale: Locale): string {
  return (
    pick({ fa: post.title_fa, ar: post.title_ar, en: post.title_en }, locale) ||
    humanizeSlug(post.slug)
  );
}

/** Short summary for the active locale (may be empty). */
export function resolveBlogExcerpt(post: BlogPost, locale: Locale): string {
  return pick(
    { fa: post.excerpt_fa, ar: post.excerpt_ar, en: post.excerpt_en },
    locale,
  );
}

/** Full body (plain text with blank-line paragraphs and `## ` sub-headings). */
export function resolveBlogBody(post: BlogPost, locale: Locale): string {
  return pick({ fa: post.body_fa, ar: post.body_ar, en: post.body_en }, locale);
}
