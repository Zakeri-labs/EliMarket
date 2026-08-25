"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import {
  deleteReviewAction,
  getAdminReviewsAction,
} from "@/app/_actions/review-actions";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { AppIcon } from "@/components/icons/AppIcon";
import { RowIconActions } from "@/components/admin/RowIconActions";
import { useFormAction } from "@/app/hooks/use-form-action";
import { useTranslations } from "@/i18n/use-translations";
import type { ProductReview } from "@/app/_types/database.types";

type AdminReview = ProductReview & {
  product: { id: string; name: string; slug: string } | null;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-[#d4a72c]">
      {Array.from({ length: 5 }).map((_, i) => (
        <AppIcon
          key={i}
          icon={Star}
          size="xs"
          className={i < rating ? "fill-current" : "text-[#e4e4e7]"}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const { t, locale } = useTranslations();
  const queryClient = useQueryClient();
  const { runAction } = useFormAction();

  const { data: reviews, isPending } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const result = await getAdminReviewsAction();
      if (!result.success) throw new Error(result.error);
      return result.data as AdminReview[];
    },
  });

  const refetch = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
  };

  return (
    <AdminShell title={t("admin.reviews.title")} subtitle={t("admin.reviews.subtitle")}>
      <div className="space-y-4">
        {isPending ? (
          <ul className="space-y-2">
            {["s1", "s2", "s3"].map((key) => (
              <li
                key={key}
                className="h-24 animate-pulse rounded-2xl border border-[#e4e4e7] bg-white"
              />
            ))}
          </ul>
        ) : reviews?.length ? (
          <ul className="space-y-2">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="rounded-2xl border border-[#e4e4e7] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#18181b]">
                      {review.product?.name ?? review.product_id}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Stars rating={review.rating} />
                      <span className="text-xs text-[#71717a]">
                        {t("admin.reviews.byLabel", { name: review.reviewer_name })}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm text-[#3f3f46]">{review.comment}</p>
                    )}
                    <p className="mt-2 text-[11px] text-[#a1a1aa]">
                      {new Date(review.created_at).toLocaleDateString(locale)}
                    </p>
                  </div>
                  <RowIconActions
                    editLabel=""
                    deleteLabel={t("admin.reviews.delete")}
                    onDelete={() =>
                      runAction(
                        () => deleteReviewAction(review.id, review.product?.slug),
                        { onSuccess: refetch },
                      )
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-[#e4e4e7] bg-white px-4 py-10 text-center text-sm text-[#71717a]">
            {t("admin.reviews.empty")}
          </p>
        )}
      </div>
    </AdminShell>
  );
}
