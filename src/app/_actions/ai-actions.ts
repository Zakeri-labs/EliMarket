"use server";

import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import { buildProductDescriptionStub } from "@/lib/ai/product-description-stub";
import {
  generateProductDescriptionsWithOpenAi,
  type GeneratedProductNameAndDescriptions,
} from "@/lib/ai/generate-product-description";
import { hasOpenAiApiKey } from "@/lib/ai/openai-client";
import { enhanceProductImageAction } from "@/app/_actions/smart-product-actions";
import { publicEnv } from "@/config/env";
import { onlyIfLocale } from "@/lib/i18n/locale-text";

async function callEdgeFunction(
  name: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  const url = `${publicEnv.supabaseUrl}/functions/v1/${name}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicEnv.supabaseAnonKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Edge function ${name} failed`);
  return res.json();
}

function asLocaleText(value: unknown, locale: "fa" | "ar" | "en"): string {
  return onlyIfLocale(typeof value === "string" ? value : "", locale);
}

function normalizeAiDescriptions(
  result: Record<string, unknown>,
  fallback: GeneratedProductNameAndDescriptions,
): GeneratedProductNameAndDescriptions | null {
  const fa =
    asLocaleText(result.description_fa, "fa") ||
    asLocaleText(result.description, "fa") ||
    fallback.description_fa;
  const ar = asLocaleText(result.description_ar, "ar") || fallback.description_ar;
  const en = asLocaleText(result.description_en, "en") || fallback.description_en;
  const name_ar = asLocaleText(result.name_ar, "ar") || fallback.name_ar;
  const name_en = asLocaleText(result.name_en, "en") || fallback.name_en;

  if (!fa && !ar && !en) return null;

  return {
    description_fa: fa,
    description_ar: ar,
    description_en: en,
    name_ar,
    name_en,
  };
}

/**
 * Re-enhance a product photo — a premium AI studio cover shot when a title
 * is given (admin reviews it in the gallery before saving), otherwise a
 * deterministic, pixel-safe crop/sharpen/background cleanup.
 */
export async function editProductImageWithAiAction(imageUrl: string, title?: string) {
  return enhanceProductImageAction(imageUrl, title);
}

/** Generate product descriptions in FA, AR, and EN (OpenAI first). */
export async function generateProductDescriptionAction(input: {
  name: string;
  category?: string;
}) {
  try {
    await requireAdmin();
    const fallback = {
      ...buildProductDescriptionStub(input),
      name_ar: onlyIfLocale(input.name, "ar"),
      name_en: onlyIfLocale(input.name, "en"),
    };

    if (hasOpenAiApiKey()) {
      try {
        const fromOpenAi = await generateProductDescriptionsWithOpenAi(input);
        if (fromOpenAi) {
          return { success: true as const, data: fromOpenAi };
        }
      } catch {
        // fall through
      }
    }

    try {
      const result = (await callEdgeFunction("generate-product-description", input)) as Record<
        string,
        unknown
      >;
      const normalized = normalizeAiDescriptions(result, fallback);
      if (normalized) {
        return { success: true as const, data: normalized };
      }
    } catch {
      // fall through to stub
    }

    return { success: true as const, data: fallback };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.aiDescriptionFailed", err),
    };
  }
}
