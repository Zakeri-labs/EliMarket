"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/core/supabase/server";
import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import { hasOpenAiApiKey } from "@/lib/ai/openai-client";
import { generateBlogPostDraftWithOpenAi } from "@/lib/ai/generate-blog-post";
import { buildBlogPostStub } from "@/lib/ai/blog-post-stub";
import type { BlogPost } from "@/app/_types/database.types";

type BlogPostInput = {
  slug: string;
  title_fa: string;
  title_ar?: string | null;
  title_en?: string | null;
  excerpt_fa?: string | null;
  excerpt_ar?: string | null;
  excerpt_en?: string | null;
  body_fa: string;
  body_ar?: string | null;
  body_en?: string | null;
  cover_url?: string | null;
  published: boolean;
  sort_order: number;
  published_at?: string | null;
};

function revalidateBlogPaths(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  revalidatePath("/dashboard/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

function text(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalize(input: Partial<BlogPostInput>) {
  const payload: Record<string, string | number | boolean | null> = {};
  if (input.slug !== undefined) payload.slug = input.slug.trim();
  if (input.title_fa !== undefined) payload.title_fa = input.title_fa.trim();
  if (input.title_ar !== undefined) payload.title_ar = text(input.title_ar);
  if (input.title_en !== undefined) payload.title_en = text(input.title_en);
  if (input.excerpt_fa !== undefined) payload.excerpt_fa = text(input.excerpt_fa);
  if (input.excerpt_ar !== undefined) payload.excerpt_ar = text(input.excerpt_ar);
  if (input.excerpt_en !== undefined) payload.excerpt_en = text(input.excerpt_en);
  if (input.body_fa !== undefined) payload.body_fa = input.body_fa.trim();
  if (input.body_ar !== undefined) payload.body_ar = text(input.body_ar);
  if (input.body_en !== undefined) payload.body_en = text(input.body_en);
  if (input.cover_url !== undefined) payload.cover_url = text(input.cover_url);
  if (input.published !== undefined) payload.published = input.published;
  if (input.sort_order !== undefined) payload.sort_order = input.sort_order;
  if (input.published_at !== undefined) {
    const raw = input.published_at?.trim();
    payload.published_at = raw ? new Date(raw).toISOString() : new Date().toISOString();
  }
  return payload;
}

/** Storefront: published posts, newest-featured first. */
export async function getPublishedBlogPostsAction() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false });

    if (error) throw error;
    return { success: true as const, data: (data ?? []) as BlogPost[] };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.blogPostsLoadFailed", err),
    };
  }
}

/** Storefront: one post by slug (RLS hides unpublished from non-admins). */
export async function getBlogPostBySlugAction(slug: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    return { success: true as const, data: (data ?? null) as BlogPost | null };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.blogPostsLoadFailed", err),
    };
  }
}

export async function getAdminBlogPostsAction() {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false });

    if (error) throw error;
    return { success: true as const, data: (data ?? []) as BlogPost[] };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.blogPostsLoadFailed", err),
    };
  }
}

export async function createBlogPostAction(input: BlogPostInput) {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("blog_posts")
      .insert(normalize(input))
      .select("*")
      .single();

    if (error) throw error;
    revalidateBlogPaths((data as BlogPost).slug);
    return { success: true as const, data: data as BlogPost };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.blogPostCreateFailed", err),
    };
  }
}

export async function updateBlogPostAction(id: string, input: Partial<BlogPostInput>) {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("blog_posts")
      .update(normalize(input))
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    revalidateBlogPaths((data as BlogPost).slug);
    return { success: true as const, data: data as BlogPost };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.blogPostUpdateFailed", err),
    };
  }
}

export async function deleteBlogPostAction(id: string) {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id)
      .select("slug")
      .maybeSingle();

    if (error) throw error;
    revalidateBlogPaths((data as { slug?: string } | null)?.slug);
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.blogPostDeleteFailed", err),
    };
  }
}

/** Draft a post (FA/AR/EN) from a topic. OpenAI when configured, stub otherwise. */
export async function generateBlogPostDraftAction(input: { topic: string }) {
  try {
    await requireAdmin();
    const topic = input.topic?.trim() || "";

    if (hasOpenAiApiKey()) {
      try {
        const draft = await generateBlogPostDraftWithOpenAi({ topic });
        if (draft) return { success: true as const, data: draft };
      } catch {
        // fall through to the stub
      }
    }

    return { success: true as const, data: buildBlogPostStub(topic) };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.aiBlogDraftFailed", err),
    };
  }
}
