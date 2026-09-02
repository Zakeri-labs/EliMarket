"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, Share2, User } from "lucide-react";
import { AppIcon } from "@/components/icons/AppIcon";
import { BlogCover } from "@/app/(storefront)/blog/_components/BlogCover";
import { getNumberLocale } from "@/i18n/config";
import { useTranslations } from "@/i18n/use-translations";
import {
  resolveBlogBody,
  resolveBlogExcerpt,
  resolveBlogTitle,
} from "@/lib/i18n/blog-post";
import { readingTimeMinutes } from "@/lib/blog/reading-time";
import type { BlogPost } from "@/app/_types/database.types";

function clamp(text: string, max: number) {
  const s = text.replace(/\s+/g, " ").trim();
  return s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`;
}

export function BlogCard({ post, priority }: { post: BlogPost; priority?: boolean }) {
  const { messages: m, locale } = useTranslations();
  const [copied, setCopied] = useState(false);

  const href = `/blog/${post.slug}`;
  const title = resolveBlogTitle(post, locale);
  const excerpt = resolveBlogExcerpt(post, locale);

  const { date, minutesLabel } = useMemo(() => {
    const numberLocale = getNumberLocale(locale);
    const d = new Intl.DateTimeFormat(numberLocale, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).format(new Date(post.published_at));
    const minutes = readingTimeMinutes(resolveBlogBody(post, locale));
    return {
      date: d,
      minutesLabel: m.blog.minutesShort.replace(
        "{count}",
        minutes.toLocaleString(numberLocale),
      ),
    };
  }, [locale, post, m.blog.minutesShort]);

  const share = async () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${href}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch (err) {
      // User dismissed the native share sheet — leave it at that.
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Anything else (desktop without a share target): fall back to copy.
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border-subtle bg-bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent-teal/40 hover:shadow-xl">
      <Link
        href={href}
        className="relative block aspect-[16/10] overflow-hidden bg-bg-tile"
        aria-label={title}
      >
        <BlogCover
          post={post}
          priority={priority}
          className="transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <AppIcon icon={CalendarDays} size="xs" />
            <time dateTime={post.published_at}>{date}</time>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <AppIcon icon={User} size="xs" />
            {m.blog.byline}
          </span>
        </div>

        <Link href={href} className="mt-3">
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-text-primary transition-colors group-hover:text-accent-teal">
            {title}
          </h3>
        </Link>

        {excerpt ? (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-secondary">
            {clamp(excerpt, 165)}
          </p>
        ) : null}

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-2 border-t border-border-subtle pt-3">
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
              {minutesLabel}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={share}
                className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-text-primary transition-colors hover:border-gold"
              >
                <AppIcon
                  icon={copied ? Check : Share2}
                  size="xs"
                  className="text-gold"
                />
                {copied ? m.blog.copied : m.blog.share}
              </button>
              <Link
                href={href}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-text-primary"
              >
                {m.blog.readMore}
                <AppIcon
                  icon={ArrowRight}
                  size="xs"
                  className="text-gold rtl:rotate-180"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
