"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/core/supabase/server";
import { requireAuth, requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import { serverT } from "@/i18n/server";
import type { ProductReview } from "@/app/_types/database.types";

function revalidateReviewPaths(productSlug?: string) {
  if (productSlug) revalidatePath(`/products/${productSlug}`);
  revalidatePath("/dashboard/reviews");
}

export async function getProductReviewsAction(productId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    const reviews = (data ?? []) as ProductReview[];
    const count = reviews.length;
    const average =
      count > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / count : 0;
    return { success: true as const, data: { reviews, average, count } };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.reviewsLoadFailed", err),
    };
  }
}

export async function createReviewAction(input: {
  productId: string;
  productSlug: string;
  rating: number;
  comment?: string | null;
}) {
  try {
    const { supabase, user, profile } = await requireAuth();
    const rating = Math.round(input.rating);
    if (rating < 1 || rating > 5) {
      throw new Error(await serverT("errors.reviewCreateFailed"));
    }

    const { data, error } = await supabase
      .from("product_reviews")
      .insert({
        product_id: input.productId,
        user_id: user.id,
        reviewer_name: profile?.full_name?.trim() || (await serverT("product.anonymousReviewer")),
        rating,
        comment: input.comment?.trim() || null,
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error(await serverT("errors.reviewAlreadyExists"));
      }
      throw error;
    }

    revalidateReviewPaths(input.productSlug);
    return { success: true as const, data: data as ProductReview };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.reviewCreateFailed", err),
    };
  }
}

export async function deleteReviewAction(id: string, productSlug?: string) {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("product_reviews").delete().eq("id", id);
    if (error) throw error;
    revalidateReviewPaths(productSlug);
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.reviewDeleteFailed", err),
    };
  }
}

export async function getAdminReviewsAction() {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("product_reviews")
      .select("*, product:products(id, name, slug)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { success: true as const, data: data ?? [] };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.reviewsLoadFailed", err),
    };
  }
}
