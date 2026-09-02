import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPostBySlugAction } from "@/app/_actions/blog-actions";
import { BlogArticle } from "@/app/(storefront)/blog/_components/BlogArticle";
import { JsonLd } from "@/lib/seo/json-ld";
import { blogPostingJsonLd, blogBreadcrumbJsonLd } from "@/lib/seo/schemas";
import { absoluteUrl, languageAlternates, trimDescription } from "@/lib/seo/site-url";
import { getMessages } from "@/i18n/messages";
import { getRequestLocale } from "@/i18n/server";
import {
  resolveBlogBody,
  resolveBlogExcerpt,
  resolveBlogTitle,
} from "@/lib/i18n/blog-post";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const meta = getMessages(locale).meta;
  const result = await getBlogPostBySlugAction(slug);

  if (!result.success || !result.data) {
    return { title: meta.blogTitle };
  }

  const post = result.data;
  const title = resolveBlogTitle(post, locale);
  const description =
    trimDescription(resolveBlogExcerpt(post, locale)) ||
    trimDescription(resolveBlogBody(post, locale).replace(/^##\s.*$/gm, ""));
  const path = `/blog/${slug}`;

  return {
    title,
    description: description || undefined,
    alternates: {
      canonical: absoluteUrl(path),
      languages: languageAlternates(path),
    },
    openGraph: {
      title,
      description: description || undefined,
      url: absoluteUrl(path),
      type: "article",
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      images: post.cover_url ? [{ url: post.cover_url, alt: title }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const result = await getBlogPostBySlugAction(slug);
  if (!result.success || !result.data) notFound();

  const post = result.data;

  return (
    <>
      <JsonLd data={[blogPostingJsonLd(post, locale), blogBreadcrumbJsonLd(post, locale)]} />
      <BlogArticle post={post} />
    </>
  );
}
