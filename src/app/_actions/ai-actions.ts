"use server";

import { publicEnv } from "@/config/env";
import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import { serverT } from "@/i18n/server";

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

/** Stub: returns original image URL until edge function is deployed */
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

/** Stub: returns placeholder description until edge function is deployed */
export async function generateProductDescriptionAction(input: {
  name: string;
  category?: string;
}) {
  try {
    await requireAdmin();
    try {
      const result = (await callEdgeFunction("generate-product-description", input)) as {
        description?: string;
      };
      if (result?.description) {
        return { success: true as const, data: { description: result.description } };
      }
    } catch {
      // fall through to stub
    }
    return {
      success: true as const,
      data: {
        description: await serverT("admin.products.aiStubDescription", {
          name: input.name,
          category: input.category
            ? await serverT("admin.products.aiStubCategorySuffix", {
                category: input.category,
              })
            : "",
        }),
      },
    };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.aiDescriptionFailed", err),
    };
  }
}
