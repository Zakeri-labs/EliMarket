"use client";

import { Suspense } from "react";
import { useTranslations } from "@/i18n/use-translations";
import CategoriesContent from "./CategoriesContent";

function CategoriesLoading() {
  const { t } = useTranslations();
  return <main className="px-4 py-8 text-muted">{t("common.loading")}</main>;
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<CategoriesLoading />}>
      <CategoriesContent />
    </Suspense>
  );
}
