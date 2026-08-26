"use client";

import { Suspense } from "react";
import AdminOrdersPageContent from "./OrdersPageContent";

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={null}>
      <AdminOrdersPageContent />
    </Suspense>
  );
}
