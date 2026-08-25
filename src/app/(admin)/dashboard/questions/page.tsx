"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  answerQuestionAction,
  deleteQuestionAction,
  getAdminQuestionsAction,
} from "@/app/_actions/question-actions";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { RowIconActions } from "@/components/admin/RowIconActions";
import { useFormAction } from "@/app/hooks/use-form-action";
import { cn } from "@/app/utils/cn";
import { useTranslations } from "@/i18n/use-translations";
import type { ProductQuestion } from "@/app/_types/database.types";

type AdminQuestion = ProductQuestion & {
  product: { id: string; name: string; slug: string } | null;
};

export default function AdminQuestionsPage() {
  const { t, locale } = useTranslations();
  const queryClient = useQueryClient();
  const { runAction, isPending: isActionPending } = useFormAction();
  const [answering, setAnswering] = useState<AdminQuestion | null>(null);
  const [answerText, setAnswerText] = useState("");

  const { data: questions, isPending } = useQuery({
    queryKey: ["admin-questions"],
    queryFn: async () => {
      const result = await getAdminQuestionsAction();
      if (!result.success) throw new Error(result.error);
      return result.data as AdminQuestion[];
    },
  });

  const refetch = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
  };

  const openAnswer = (question: AdminQuestion) => {
    setAnswering(question);
    setAnswerText(question.answer ?? "");
  };

  const closeAnswer = () => {
    setAnswering(null);
    setAnswerText("");
  };

  const submitAnswer = () => {
    if (!answering) return;
    runAction(
      () => answerQuestionAction(answering.id, answerText, answering.product?.slug),
      { onSuccess: () => { closeAnswer(); refetch(); } },
    );
  };

  return (
    <AdminShell title={t("admin.questions.title")} subtitle={t("admin.questions.subtitle")}>
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
        ) : questions?.length ? (
          <ul className="space-y-2">
            {questions.map((question) => (
              <li
                key={question.id}
                className="rounded-2xl border border-[#e4e4e7] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[#18181b]">
                        {question.product?.name ?? question.product_id}
                      </p>
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                          question.answer
                            ? "bg-[#6b8f71]/12 text-[#527559]"
                            : "bg-amber-100 text-amber-700",
                        )}
                      >
                        {question.answer
                          ? t("admin.questions.answeredBadge")
                          : t("admin.questions.awaitingBadge")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#71717a]">
                      {t("admin.questions.askedByLabel", { name: question.asker_name })}
                      {" · "}
                      {new Date(question.created_at).toLocaleDateString(locale)}
                    </p>
                    <p className="mt-2 text-sm text-[#3f3f46]">{question.question}</p>
                    {question.answer && (
                      <p className="mt-2 rounded-lg bg-[#f4f4f5] px-3 py-2 text-sm text-[#18181b]">
                        {question.answer}
                      </p>
                    )}
                  </div>
                  <RowIconActions
                    editLabel={t("admin.questions.answer")}
                    deleteLabel={t("admin.questions.delete")}
                    onEdit={() => openAnswer(question)}
                    onDelete={() =>
                      runAction(
                        () => deleteQuestionAction(question.id, question.product?.slug),
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
            {t("admin.questions.empty")}
          </p>
        )}

        <Modal
          open={answering !== null}
          onOpenChange={(open) => {
            if (!open) closeAnswer();
          }}
          title={t("admin.questions.answerModalTitle")}
          size="md"
          busy={isActionPending}
          busyLabel={t("common.saving")}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={closeAnswer} disabled={isActionPending}>
                {t("admin.brands.cancel")}
              </Button>
              <Button
                type="button"
                onClick={submitAnswer}
                loading={isActionPending}
                loadingLabel={t("common.saving")}
              >
                {t("admin.questions.submitAnswer")}
              </Button>
            </>
          }
        >
          {answering && (
            <div className="space-y-3">
              <p className="rounded-lg bg-[#f4f4f5] px-3 py-2 text-sm text-[#18181b]">
                {answering.question}
              </p>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder={t("admin.questions.answerPlaceholder")}
                rows={4}
                className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
              />
            </div>
          )}
        </Modal>
      </div>
    </AdminShell>
  );
}
