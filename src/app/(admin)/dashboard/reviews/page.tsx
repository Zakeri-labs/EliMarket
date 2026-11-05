"use client";

import { resolveLocalizedName } from "@/lib/i18n/product-name";
import { KpiRow } from "@/app/(admin)/_components/KpiCards";
import { formatOmanDate } from "@/config/oman-time";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import {
  deleteReviewAction,
  getAdminReviewsAction,
} from "@/app/_actions/review-actions";
import { ListControls, ListPager, ListError, useListControls } from "@/app/(admin)/_components/ListControls";
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
    <div role="img" aria-label={`${rating}/5`} className="flex items-center gap-0.5 text-amber-600">
      {Array.from({ length: 5 }).map((_, i) => (
        <AppIcon
          key={i}
          icon={Star}
          size="xs"
          className={i < rating ? "fill-current" : "text-[var(--input)]"}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const { t, locale } = useTranslations();
  const queryClient = useQueryClient();
  const { runAction } = useFormAction();

  const { data: reviews, isPending, error: loadError } = useQuery({
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

  const list = useListControls(reviews ?? []);

  return (
    <AdminShell title={t("admin.reviews.title")} subtitle={t("admin.reviews.subtitle")}>
      <KpiRow
        hidden={Boolean(loadError) && !reviews}
        items={[{ label: t("adminUi.total"), value: reviews?.length, icon: "star", tone: "teal" },
{ label: t("adminUi.avgRating"), value: reviews ? (reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0) : undefined, decimals: 1, icon: "star", tone: "amber" },
{ label: t("adminUi.fiveStar"), value: reviews?.filter((r) => r.rating === 5).length, icon: "check", tone: "sky" },
{ label: t("adminUi.lowRated"), value: reviews?.filter((r) => r.rating <= 2).length, icon: "alert", tone: "rose" },]}
      />
      <div className="space-y-4">
        {loadError ? <ListError error={loadError} onRetry={() => void refetch()} /> : null}
        <ListControls list={list} entity={t("admin.nav.reviews")} />
        {loadError && !reviews ? null : isPending ? (
          <ul className="space-y-2">
            {["s1", "s2", "s3"].map((key) => (
              <li
                key={key}
                className="h-24 animate-pulse admin-card"
              />
            ))}
          </ul>
        ) : reviews?.length ? (
          <>
<ul className="space-y-2">
            {list.visible.map((review) => (
              <li
                key={review.id}
                className="admin-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {review.product ? resolveLocalizedName(review.product, locale) : review.product_id}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Stars rating={review.rating} />
                      <span className="text-xs text-muted">
                        {t("admin.reviews.byLabel", { name: review.reviewer_name })}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm text-foreground" dir="auto">{review.comment}</p>
                    )}
                    <p className="mt-2 text-xs text-muted">
                      {formatOmanDate(review.created_at, locale)}
                    </p>
                  </div>
                  <RowIconActions
                    editLabel=""
                    deleteLabel={t("admin.reviews.delete")}
                    onDelete={() =>
                      runAction(
                        () => deleteReviewAction(review.id, review.product?.slug),
                        { successMessage: t("adminUi.deleted"), onSuccess: refetch },
                      )
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
<ListPager list={list} />
</>
        ) : (
          <p className="admin-card px-4 py-10 text-center text-sm text-muted">
            {t("admin.reviews.empty")}
          </p>
        )}
      </div>
    </AdminShell>
  );
}
