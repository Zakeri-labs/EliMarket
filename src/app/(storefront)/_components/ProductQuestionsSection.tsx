"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuestionAction, getProductQuestionsAction } from "@/app/_actions/question-actions";
import { useAuthStore } from "@/app/_store/auth-store";
import { useFormAction } from "@/app/hooks/use-form-action";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  productId: string;
  productSlug: string;
};

export function ProductQuestionsSection({ productId, productSlug }: Props) {
  const { t, locale, dir } = useTranslations();
  const queryClient = useQueryClient();
  const session = useAuthStore((s) => s.session);
  const { runAction, isPending } = useFormAction();
  const [question, setQuestion] = useState("");

  const { data: questions, isPending: isLoading } = useQuery({
    queryKey: ["product-questions", productId],
    queryFn: async () => {
      const result = await getProductQuestionsAction(productId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const submit = () => {
    if (!question.trim()) return;
    runAction(
      () => createQuestionAction({ productId, productSlug, question }),
      {
        onSuccess: () => {
          setQuestion("");
          void queryClient.invalidateQueries({ queryKey: ["product-questions", productId] });
        },
      },
    );
  };

  if (isLoading) {
    return <div className="h-24 animate-pulse rounded-2xl bg-surface" />;
  }

  const items = questions ?? [];

  return (
    <div dir={dir} className="space-y-4">
      {items.length === 0 ? (
        <p className="text-sm text-muted">{t("product.noQuestionsYet")}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border border-border bg-surface p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{item.asker_name}</p>
                <span className="text-[11px] text-muted">
                  {new Date(item.created_at).toLocaleDateString(locale)}
                </span>
              </div>
              <p className="mt-1 text-sm leading-6">{item.question}</p>
              {item.answer ? (
                <div className="mt-2 rounded-lg bg-surface-elevated px-3 py-2">
                  <p className="mb-0.5 text-[11px] font-semibold text-accent-teal">
                    {t("product.storeAnswer")}
                  </p>
                  <p className="text-sm text-muted">{item.answer}</p>
                </div>
              ) : (
                <p className="mt-2 text-xs italic text-muted">{t("product.awaitingAnswer")}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {session ? (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-2 text-sm font-medium">{t("product.askQuestion")}</p>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t("product.questionPlaceholder")}
            rows={3}
            className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm"
          />
          <Button
            type="button"
            size="sm"
            className="mt-3"
            disabled={!question.trim()}
            loading={isPending}
            onClick={submit}
          >
            {t("product.submitQuestion")}
          </Button>
        </div>
      ) : (
        <Link
          href="/account"
          className="block rounded-2xl border border-dashed border-border bg-surface p-4 text-center text-sm font-medium text-accent-teal"
        >
          {t("product.signInToAsk")}
        </Link>
      )}
    </div>
  );
}
