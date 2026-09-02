import type { Metadata } from "next";
import { getPublishedBlogPostsAction } from "@/app/_actions/blog-actions";
import { BlogList } from "@/app/(storefront)/blog/_components/BlogList";
import { JsonLd } from "@/lib/seo/json-ld";
import { blogListJsonLd } from "@/lib/seo/schemas";
import { absoluteUrl, languageAlternates } from "@/lib/seo/site-url";
import { getMessages } from "@/i18n/messages";
import { getRequestLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const meta = getMessages(locale).meta;

  return {
    title: meta.blogTitle,
    description: meta.blogDescription,
    alternates: {
      canonical: absoluteUrl("/blog"),
      languages: languageAlternates("/blog"),
    },
    openGraph: {
      title: meta.blogTitle,
      description: meta.blogDescription,
      url: absoluteUrl("/blog"),
      type: "website",
    },
  };
}

export default async function BlogIndexPage() {
  const locale = await getRequestLocale();
  const result = await getPublishedBlogPostsAction();
  const posts = result.success ? result.data : [];

  return (
    <>
      <JsonLd data={blogListJsonLd(posts, locale)} />
      <BlogList posts={posts} />
    </>
  );
}
