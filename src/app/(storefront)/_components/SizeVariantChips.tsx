"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getProductVariantsAction } from "@/app/_actions/product-actions";
import { cn } from "@/app/utils/cn";
import { useTranslations } from "@/i18n/use-translations";
import { Price } from "@/components/ui/Price";
import { firstFitting, humanizeSlug } from "@/lib/i18n/locale-text";

type Props = {
  productId: string;
  currentProductId: string;
};

export function SizeVariantChips({ productId, currentProductId }: Props) {
  const { t, dir, locale } = useTranslations();

  const { data: variants } = useQuery({
    queryKey: ["product-variants", productId],
    queryFn: async () => {
      const result = await getProductVariantsAction(productId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  if (!variants || variants.length <= 1) return null;

  return (
    <div dir={dir}>
      <p className="mb-2 text-start text-[11px] font-semibold uppercase tracking-wide text-muted">
        {t("product.size")}
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isCurrent = variant.id === currentProductId;
          return (
            <Link
              key={variant.id}
              href={isCurrent ? "#" : `/products/${variant.slug}`}
              aria-current={isCurrent ? "true" : undefined}
              className={cn(
                "flex min-w-16 flex-col items-center gap-0.5 rounded-xl border px-3 py-2 text-center",
                isCurrent
                  ? "border-accent-teal bg-accent-teal/10 text-accent-teal"
                  : "border-border bg-surface text-foreground hover:border-accent-teal/50",
              )}
              onClick={(e) => {
                if (isCurrent) e.preventDefault();
              }}
            >
              <span className="text-sm font-semibold">
                {firstFitting(locale, variant.variant_label) || humanizeSlug(variant.slug)}
              </span>
              <Price
                amount={Number(variant.price)}
                currency={variant.currency}
                className="text-[11px] text-muted"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
