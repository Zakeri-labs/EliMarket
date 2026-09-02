import type { BlogPost } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";

type LocalizedTriple = { fa: string | null; ar: string | null; en: string | null };

function pick(triple: LocalizedTriple, locale: Locale): string {
  const localized = triple[locale];
  return (
    localized?.trim() ||
    triple.fa?.trim() ||
    triple.ar?.trim() ||
    triple.en?.trim() ||
    ""
  );
}

/** Post headline for the active locale, with fa → ar → en fallback. */
export function resolveBlogTitle(post: BlogPost, locale: Locale): string {
  return pick({ fa: post.title_fa, ar: post.title_ar, en: post.title_en }, locale);
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
