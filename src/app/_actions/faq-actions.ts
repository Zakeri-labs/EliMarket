"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/core/supabase/server";
import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import type { FaqItem } from "@/lib/faq/types";

export type FaqInput = {
  question_fa: string;
  question_ar?: string | null;
  question_en?: string | null;
  answer_fa: string;
  answer_ar?: string | null;
  answer_en?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

function revalidateFaqPaths() {
  revalidatePath("/contact");
  revalidatePath("/dashboard/questions");
}

function clean(input: FaqInput) {
  const opt = (v?: string | null) => v?.trim() || null;
  return {
    question_fa: input.question_fa.trim(),
    question_ar: opt(input.question_ar),
    question_en: opt(input.question_en),
    answer_fa: input.answer_fa.trim(),
    answer_ar: opt(input.answer_ar),
    answer_en: opt(input.answer_en),
    sort_order: input.sort_order ?? 0,
    is_active: input.is_active ?? true,
  };
}

export async function getFaqItemsAction() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("faq_items")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .order("created_at");
    if (error) throw error;
    return { success: true as const, data: (data ?? []) as FaqItem[] };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.faqFailed", err),
    };
  }
}

export async function getAdminFaqItemsAction() {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("faq_items")
      .select("*")
      .order("sort_order")
      .order("created_at");
    if (error) throw error;
    return { success: true as const, data: (data ?? []) as FaqItem[] };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.faqFailed", err),
    };
  }
}

export async function createFaqItemAction(input: FaqInput) {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("faq_items")
      .insert(clean(input))
      .select("*")
      .single();
    if (error) throw error;
    revalidateFaqPaths();
    return { success: true as const, data: data as FaqItem };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.faqFailed", err),
    };
  }
}

export async function updateFaqItemAction(id: string, input: FaqInput) {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("faq_items")
      .update(clean(input))
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    revalidateFaqPaths();
    return { success: true as const, data: data as FaqItem };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.faqFailed", err),
    };
  }
}

export async function deleteFaqItemAction(id: string) {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("faq_items").delete().eq("id", id);
    if (error) throw error;
    revalidateFaqPaths();
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.faqFailed", err),
    };
  }
}
