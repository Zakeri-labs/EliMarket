"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  answerQuestionAction,
  deleteQuestionAction,
  getAdminQuestionsAction,
} from "@/app/_actions/question-actions";
import {
  createFaqItemAction,
  deleteFaqItemAction,
  getAdminFaqItemsAction,
  updateFaqItemAction,
  type FaqInput,
} from "@/app/_actions/faq-actions";
import type { FaqItem } from "@/lib/faq/types";
import { Plus } from "lucide-react";
import { AppIcon } from "@/components/icons/AppIcon";
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

const EMPTY_FAQ: FaqInput = {
  question_fa: "",
  question_ar: "",
  question_en: "",
  answer_fa: "",
  answer_ar: "",
  answer_en: "",
  sort_order: 0,
  is_active: true,
};

const LANGS = [
  { code: "fa", label: "فارسی", dir: "rtl" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "en", label: "English", dir: "ltr" },
] as const;

const faqFieldClass =
  "w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm outline-none focus:border-[#0d9488]";

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

  const [faqForm, setFaqForm] = useState<FaqInput | null>(null);
  const [faqEditingId, setFaqEditingId] = useState<string | null>(null);

  const { data: faqItems, isPending: isFaqPending } = useQuery({
    queryKey: ["admin-faq-items"],
    queryFn: async () => {
      const result = await getAdminFaqItemsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const refetchFaq = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-faq-items"] });
    void queryClient.invalidateQueries({ queryKey: ["faq-items"] });
  };

  const openFaq = (item?: FaqItem) => {
    setFaqEditingId(item?.id ?? null);
    setFaqForm(
      item
        ? {
            question_fa: item.question_fa,
            question_ar: item.question_ar ?? "",
            question_en: item.question_en ?? "",
            answer_fa: item.answer_fa,
            answer_ar: item.answer_ar ?? "",
            answer_en: item.answer_en ?? "",
            sort_order: item.sort_order,
            is_active: item.is_active,
          }
        : { ...EMPTY_FAQ, sort_order: (faqItems?.length ?? 0) + 1 },
    );
  };

  const closeFaq = () => {
    setFaqForm(null);
    setFaqEditingId(null);
  };

  const submitFaq = () => {
    if (!faqForm) return;
    if (!faqForm.question_fa.trim() || !faqForm.answer_fa.trim()) return;
    runAction(
      () =>
        faqEditingId
          ? updateFaqItemAction(faqEditingId, faqForm)
          : createFaqItemAction(faqForm),
      { onSuccess: () => { closeFaq(); refetchFaq(); } },
    );
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
      <div className="space-y-8">
        <section className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#18181b]">{t("admin.questions.faqTitle")}</h2>
              <p className="text-xs text-[#71717a]">{t("admin.questions.faqSubtitle")}</p>
            </div>
            <Button type="button" size="sm" className="!shadow-none" onClick={() => openFaq()}>
              <AppIcon icon={Plus} size="xs" className="me-1.5" />
              {t("admin.questions.faqAdd")}
            </Button>
          </div>
          {isFaqPending ? (
            <div className="h-24 animate-pulse rounded-2xl border border-[#e4e4e7] bg-white" />
          ) : faqItems?.length ? (
            <ul className="space-y-2">
              {faqItems.map((item) => (
                <li key={item.id} className="rounded-2xl border border-[#e4e4e7] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[#18181b]">{item.question_fa}</p>
                        {!item.is_active && (
                          <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600">
                            {t("admin.questions.faqInactiveBadge")}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-sm text-[#52525b]">{item.answer_fa}</p>
                    </div>
                    <RowIconActions
                      editLabel={t("admin.questions.faqEdit")}
                      deleteLabel={t("admin.questions.faqDelete")}
                      onEdit={() => openFaq(item)}
                      onDelete={() =>
                        runAction(() => deleteFaqItemAction(item.id), { onSuccess: refetchFaq })
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-[#e4e4e7] bg-white px-4 py-8 text-center text-sm text-[#71717a]">
              {t("admin.questions.faqEmpty")}
            </p>
          )}
        </section>

        <section className="space-y-3">
        <h2 className="text-base font-semibold text-[#18181b]">{t("admin.questions.customerQuestionsTitle")}</h2>
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
                            ? "bg-[#0d9488]/12 text-[#0f766e]"
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
        </section>

        <Modal
          open={faqForm !== null}
          onOpenChange={(open) => {
            if (!open) closeFaq();
          }}
          title={faqEditingId ? t("admin.questions.faqEditTitle") : t("admin.questions.faqNewTitle")}
          size="lg"
          busy={isActionPending}
          busyLabel={t("common.saving")}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={closeFaq} disabled={isActionPending}>
                {t("admin.brands.cancel")}
              </Button>
              <Button
                type="button"
                onClick={submitFaq}
                loading={isActionPending}
                loadingLabel={t("common.saving")}
                disabled={!faqForm?.question_fa.trim() || !faqForm?.answer_fa.trim()}
              >
                {t("admin.questions.faqSave")}
              </Button>
            </>
          }
        >
          {faqForm && (
            <div className="space-y-4">
              <p className="text-xs text-[#71717a]">{t("admin.questions.faqLangHint")}</p>
              {LANGS.map((lang) => (
                <div key={lang.code} className="space-y-2 rounded-xl border border-[#f0f0f2] p-3">
                  <p className="text-xs font-semibold text-[#0f766e]">{lang.label}</p>
                  <input
                    dir={lang.dir}
                    value={faqForm[`question_${lang.code}`] ?? ""}
                    onChange={(e) => setFaqForm({ ...faqForm, [`question_${lang.code}`]: e.target.value })}
                    placeholder={t("admin.questions.faqQuestionLabel")}
                    className={faqFieldClass}
                  />
                  <textarea
                    dir={lang.dir}
                    rows={3}
                    value={faqForm[`answer_${lang.code}`] ?? ""}
                    onChange={(e) => setFaqForm({ ...faqForm, [`answer_${lang.code}`]: e.target.value })}
                    placeholder={t("admin.questions.faqAnswerLabel")}
                    className={faqFieldClass}
                  />
                </div>
              ))}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={faqForm.is_active ?? true}
                  onChange={(e) => setFaqForm({ ...faqForm, is_active: e.target.checked })}
                />
                {t("admin.questions.faqActiveLabel")}
              </label>
            </div>
          )}
        </Modal>

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
