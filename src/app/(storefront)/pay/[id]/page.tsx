"use client";

import { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  cancelPaymentAction,
  confirmSandboxPaymentAction,
  getPaymentAction,
} from "@/app/_actions/payment-actions";
import { Button } from "@/components/ui/Button";
import { useFormAction } from "@/app/hooks/use-form-action";
import { useTranslations } from "@/i18n/use-translations";
import { Price } from "@/components/ui/Price";
import type { Payment } from "@/app/_types/database.types";

export default function PayPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <PayPageContent params={params} />
    </Suspense>
  );
}

function PayPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslations();
  const { runAction, isPending } = useFormAction();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cancelled = searchParams.get("cancelled") === "1";

  useEffect(() => {
    getPaymentAction(id).then((result) => {
      if (result.success) setPayment(result.data);
      else setError(result.error);
    });
  }, [id]);

  if (error) {
    return (
      <main className="px-4 py-16 text-center">
        <p className="text-red-400">{error}</p>
        <Link href="/checkout" className="mt-4 inline-block text-accent">
          {t("checkout.back")}
        </Link>
      </main>
    );
  }

  if (!payment) {
    return (
      <main className="px-4 py-16 text-center text-muted">
        {t("common.loading")}
      </main>
    );
  }

  if (payment.status === "paid") {
    return (
      <main className="px-4 py-16 text-center">
        <p className="mb-4 font-semibold text-accent">{t("checkout.paymentSuccess")}</p>
        <Button type="button" onClick={() => router.push(`/orders/${payment.order_id}`)}>
          {t("orders.title")}
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-10">
      <h1 className="text-xl font-bold">{t("checkout.payNow")}</h1>
      <p className="text-sm text-muted">
        {t("checkout.paymentPending")} —{" "}
        <Price amount={Number(payment.amount)} currency={payment.currency} />
      </p>
      {(cancelled || payment.status === "failed") && (
        <p className="text-sm text-red-400">{t("checkout.paymentFailed")}</p>
      )}
      {payment.provider === "sandbox" && (
        <Button
          type="button"
          fullWidth
          loading={isPending}
          loadingLabel={t("common.processing")}
          onClick={() =>
            runAction(() => confirmSandboxPaymentAction(payment.id), {
              successMessage: t("checkout.paymentSuccess"),
              onSuccess: () => router.push(`/orders/${payment.order_id}`),
            })
          }
        >
          {t("checkout.sandboxPay")}
        </Button>
      )}
      <Button
        type="button"
        variant="secondary"
        fullWidth
        loading={isPending}
        loadingLabel={t("common.processing")}
        onClick={() =>
          runAction(() => cancelPaymentAction(payment.id), {
            onSuccess: () => router.push("/checkout"),
          })
        }
      >
        {t("checkout.back")}
      </Button>
    </main>
  );
}
