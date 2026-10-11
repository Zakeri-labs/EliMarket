export type FaqItem = {
  id: string;
  question_fa: string;
  question_ar: string | null;
  question_en: string | null;
  answer_fa: string;
  answer_ar: string | null;
  answer_en: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export function resolveFaqText(item: FaqItem, locale: string) {
  const pick = (fa: string, ar: string | null, en: string | null) =>
    (locale === "ar" ? ar : locale === "en" ? en : fa)?.trim() || fa;
  return {
    question: pick(item.question_fa, item.question_ar, item.question_en),
    answer: pick(item.answer_fa, item.answer_ar, item.answer_en),
  };
}
