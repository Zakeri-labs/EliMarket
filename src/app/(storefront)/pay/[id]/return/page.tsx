"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyThawaniPaymentAction } from "@/app/_actions/payment-actions";
import { useTranslations } from "@/i18n/use-translations";

export default function PayReturnPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense>
      <PayReturnContent params={params} />
    </Suspense>
  );
}

function PayReturnContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useTranslations();
  const [message, setMessage] = useState(t("checkout.paymentRedirecting"));

  useEffect(() => {
    verifyThawaniPaymentAction(id).then((result) => {
      if (result.success && result.data.paid) {
        router.replace(`/orders/${result.data.orderId}`);
        return;
      }
      setMessage(result.success ? t("checkout.paymentFailed") : result.error);
    });
  }, [id, router, t]);

  return (
    <main className="px-4 py-16 text-center text-muted">{message}</main>
  );
}
