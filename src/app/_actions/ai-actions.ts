"use server";

import { publicEnv } from "@/config/env";
import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import {
  buildProductDescriptionStub,
  type ProductDescriptionsI18n,
} from "@/lib/ai/product-description-stub";

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

function normalizeAiDescriptions(
  result: Record<string, unknown>,
  fallback: ProductDescriptionsI18n,
): ProductDescriptionsI18n | null {
  const fa =
    (typeof result.description_fa === "string" && result.description_fa) ||
    (typeof result.description === "string" && result.description) ||
    fallback.description_fa;
  const ar =
    (typeof result.description_ar === "string" && result.description_ar) ||
    fallback.description_ar;
  const en =
    (typeof result.description_en === "string" && result.description_en) ||
    fallback.description_en;

  if (!fa && !ar && !en) return null;

  return {
    description_fa: fa,
    description_ar: ar,
    description_en: en,
  };
}

/** Stub: returns placeholder descriptions until edge function is deployed */
export async function editProductImageWithAiAction(imageUrl: string) {
  try {
    await requireAdmin();
    try {
      const result = (await callEdgeFunction("edit-product-image", {
        imageUrl,
      })) as { url?: string };
      if (result?.url) return { success: true as const, data: { url: result.url } };
    } catch {
      // fall through to stub
    }
    return { success: true as const, data: { url: imageUrl } };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.aiImageFailed", err),
    };
  }
}

/** Generate product descriptions in FA, AR, and EN */
export async function generateProductDescriptionAction(input: {
  name: string;
  category?: string;
}) {
  try {
    await requireAdmin();
    const fallback = buildProductDescriptionStub(input);

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
