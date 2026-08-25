"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { createReviewAction, getProductReviewsAction } from "@/app/_actions/review-actions";
import { useAuthStore } from "@/app/_store/auth-store";
import { useFormAction } from "@/app/hooks/use-form-action";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  productId: string;
  productSlug: string;
};

function StarPicker({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-0.5 text-[#d4a72c]"
          aria-label={String(star)}
        >
          <AppIcon icon={Star} size="md" className={star <= value ? "fill-current" : "text-border"} />
        </button>
      ))}
    </div>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-[#d4a72c]">
      {[1, 2, 3, 4, 5].map((star) => (
        <AppIcon
          key={star}
          icon={Star}
          size="xs"
          className={star <= rating ? "fill-current" : "text-border"}
        />
      ))}
    </div>
  );
}

export function ProductReviewsSection({ productId, productSlug }: Props) {
  const { t, locale, dir } = useTranslations();
  const queryClient = useQueryClient();
  const session = useAuthStore((s) => s.session);
  const { runAction, isPending } = useFormAction();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data, isPending: isLoading } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      const result = await getProductReviewsAction(productId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const submit = () => {
    if (rating < 1) return;
    runAction(
      () => createReviewAction({ productId, productSlug, rating, comment }),
      {
        onSuccess: () => {
          setRating(0);
          setComment("");
          void queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] });
        },
      },
    );
  };

  if (isLoading) {
    return <div className="h-24 animate-pulse rounded-2xl bg-surface" />;
  }

  const reviews = data?.reviews ?? [];

  return (
    <div dir={dir} className="space-y-4">
      {reviews.length === 0 ? (
        <p className="text-sm text-muted">{t("product.noReviewsYet")}</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-xl border border-border bg-surface p-3.5">
              <div className="flex items-center justify-between gap-2">
                <StarRow rating={review.rating} />
                <span className="text-[11px] text-muted">
                  {new Date(review.created_at).toLocaleDateString(locale)}
                </span>
              </div>
              <p className="mt-1.5 text-sm font-medium">{review.reviewer_name}</p>
              {review.comment && (
                <p className="mt-1 text-sm leading-6 text-muted">{review.comment}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {session ? (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-2 text-sm font-medium">{t("product.writeReview")}</p>
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-xs text-muted">{t("product.yourRating")}</span>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("product.reviewPlaceholder")}
            rows={3}
            className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm"
          />
          <Button
            type="button"
            size="sm"
            className={cn("mt-3")}
            disabled={rating < 1}
            loading={isPending}
            onClick={submit}
          >
            {t("product.submitReview")}
          </Button>
        </div>
      ) : (
        <Link
          href="/account"
          className="block rounded-2xl border border-dashed border-border bg-surface p-4 text-center text-sm font-medium text-accent-teal"
        >
          {t("product.signInToReview")}
        </Link>
      )}
    </div>
  );
}
