"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Share2,
  User,
} from "lucide-react";
import { BlogPostBody } from "@/app/(storefront)/blog/_components/BlogPostBody";
import { BlogCover } from "@/app/(storefront)/blog/_components/BlogCover";
import { AppIcon } from "@/components/icons/AppIcon";
import { STORE_LOCATION, storeAddressLine, storeGeoUrl } from "@/config/store-location";
import { getNumberLocale } from "@/i18n/config";
import { useTranslations } from "@/i18n/use-translations";
import { resolveBlogBody, resolveBlogTitle } from "@/lib/i18n/blog-post";
import { readingTimeMinutes } from "@/lib/blog/reading-time";
import type { BlogPost } from "@/app/_types/database.types";

/** Per-viewer "saved" flag backed by localStorage (survives reloads, private to the device). */
function useBookmark(slug: string) {
  const key = `blog:saved:${slug}`;
  const read = () => {
    try {
      return window.localStorage.getItem(key) === "1";
    } catch {
      return false;
    }
  };
  const saved = useSyncExternalStore(
    (cb) => {
      window.addEventListener("storage", cb);
      return () => window.removeEventListener("storage", cb);
    },
    read,
    () => false,
  );
  const toggle = () => {
    try {
      if (read()) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, "1");
      window.dispatchEvent(new StorageEvent("storage", { key }));
    } catch {
      /* storage blocked */
    }
  };
  return [saved, toggle] as const;
}

export function BlogArticle({ post }: { post: BlogPost }) {
  const { messages: m, locale } = useTranslations();
  const [copied, setCopied] = useState(false);
  const [saved, toggleSave] = useBookmark(post.slug);

  const title = resolveBlogTitle(post, locale);
  const body = resolveBlogBody(post, locale);
  const addressLine = storeAddressLine(locale);

  const meta = useMemo(() => {
    const numberLocale = getNumberLocale(locale);
    const date = new Intl.DateTimeFormat(numberLocale, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).format(new Date(post.published_at));
    const minutes = readingTimeMinutes(body);
    return {
      date,
      read: m.blog.readingTime.replace(
        "{count}",
        minutes.toLocaleString(numberLocale),
      ),
    };
  }, [locale, post.published_at, body, m.blog.readingTime]);

  const share = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const chipClass =
    "inline-flex items-center gap-1.5 rounded-full border border-border-subtle px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-text-primary transition-colors hover:border-gold";

  return (
    <main className="py-6 md:py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-text-secondary transition-colors hover:text-text-primary"
        >
          <AppIcon icon={ArrowLeft} size="xs" className="rtl:rotate-180" />
          {m.blog.backToList}
        </Link>

        <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl md:text-5xl">
          {title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border-subtle py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-teal/12 text-accent-teal">
              <AppIcon icon={User} size="sm" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-text-primary">{m.blog.byline}</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary">
                {m.blog.bylineRole}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-teal">
              <AppIcon icon={CalendarDays} size="xs" />
              <time dateTime={post.published_at}>{meta.date}</time>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              <AppIcon icon={Clock} size="xs" />
              {meta.read}
            </span>
            <button type="button" onClick={share} className={chipClass}>
              <AppIcon icon={copied ? Check : Share2} size="xs" className="text-gold" />
              {copied ? m.blog.copied : m.blog.share}
            </button>
            <button
              type="button"
              onClick={toggleSave}
              aria-pressed={saved}
              aria-label={saved ? m.blog.saved : m.blog.save}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                saved
                  ? "border-gold text-gold"
                  : "border-border-subtle text-text-secondary hover:border-gold hover:text-gold"
              }`}
            >
              <AppIcon icon={saved ? BookmarkCheck : Bookmark} size="xs" />
            </button>
          </div>
        </div>

        <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-3xl bg-bg-tile">
          <BlogCover post={post} priority />
        </div>

        <div className="mt-8 border-b border-border-subtle pb-10">
          <BlogPostBody body={body} />
        </div>

        <section className="mt-10 overflow-hidden rounded-3xl border border-border-subtle">
          <div className="bg-accent-teal/10 px-6 py-10 text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-teal/15 text-accent-teal">
              <AppIcon icon={MapPin} size="md" />
            </span>
            <h2 className="text-xl font-bold text-text-primary sm:text-2xl">
              {m.blog.locationHeading}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary">
              {m.blog.ctaBody}
              <br />
              <span className="font-medium text-text-primary">
                {STORE_LOCATION.name} · {addressLine}
              </span>
            </p>
            <a
              href={storeGeoUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-teal px-6 py-3 text-sm font-bold text-on-accent transition-transform hover:scale-[1.02]"
            >
              <AppIcon icon={MapPin} size="xs" />
              {m.blog.viewOnMaps}
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
