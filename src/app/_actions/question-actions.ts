"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/core/supabase/server";
import { requireAuth, requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import { serverT } from "@/i18n/server";
import type { ProductQuestion } from "@/app/_types/database.types";

function revalidateQuestionPaths(productSlug?: string) {
  if (productSlug) revalidatePath(`/products/${productSlug}`);
  revalidatePath("/dashboard/questions");
}

export async function getProductQuestionsAction(productId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("product_questions")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return { success: true as const, data: (data ?? []) as ProductQuestion[] };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.questionsLoadFailed", err),
    };
  }
}

export async function createQuestionAction(input: {
  productId: string;
  productSlug: string;
  question: string;
}) {
  try {
    const { supabase, user, profile } = await requireAuth();
    const question = input.question.trim();
    if (!question) {
      throw new Error(await serverT("errors.questionCreateFailed"));
    }

    const { data, error } = await supabase
      .from("product_questions")
      .insert({
        product_id: input.productId,
        user_id: user.id,
        asker_name: profile?.full_name?.trim() || (await serverT("product.anonymousReviewer")),
        question,
      })
      .select("*")
      .single();
    if (error) throw error;

    revalidateQuestionPaths(input.productSlug);
    return { success: true as const, data: data as ProductQuestion };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.questionCreateFailed", err),
    };
  }
}

export async function answerQuestionAction(
  id: string,
  answer: string,
  productSlug?: string,
) {
  try {
    const { supabase } = await requireAdmin();
    const trimmed = answer.trim();
    if (!trimmed) {
      throw new Error(await serverT("errors.questionAnswerFailed"));
    }
    const { data, error } = await supabase
      .from("product_questions")
      .update({ answer: trimmed, answered_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;

    revalidateQuestionPaths(productSlug);
    return { success: true as const, data: data as ProductQuestion };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.questionAnswerFailed", err),
    };
  }
}

export async function deleteQuestionAction(id: string, productSlug?: string) {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("product_questions").delete().eq("id", id);
    if (error) throw error;
    revalidateQuestionPaths(productSlug);
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.questionDeleteFailed", err),
    };
  }
}

export async function getAdminQuestionsAction() {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("product_questions")
      .select("*, product:products(id, name, slug)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { success: true as const, data: data ?? [] };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.questionsLoadFailed", err),
    };
  }
}
