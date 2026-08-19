"use client";

import { Suspense } from "react";
import CategoriesContent from "./CategoriesContent";

export default function CategoriesPage() {
  return (
    <Suspense fallback={<main className="px-4 py-8 text-muted">بارگذاری…</main>}>
      <CategoriesContent />
    </Suspense>
  );
}
