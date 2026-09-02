"use client";

import { BlogCard } from "@/app/(storefront)/blog/_components/BlogCard";
import { useTranslations } from "@/i18n/use-translations";
import type { BlogPost } from "@/app/_types/database.types";

export function BlogList({ posts }: { posts: BlogPost[] }) {
  const { messages: m } = useTranslations();

  return (
    <main className="py-6 md:py-10">
      <header className="mb-8 border-b border-border-subtle pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          {m.blog.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary md:text-base">
          {m.blog.subtitle}
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border-subtle bg-bg-card px-4 py-16 text-center text-sm text-text-secondary">
          {m.blog.empty}
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <li key={post.id}>
              <BlogCard post={post} priority={i < 3} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
