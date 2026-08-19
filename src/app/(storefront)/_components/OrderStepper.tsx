"use client";

import type { OrderStatus } from "@/app/_types/database.types";
import { useTranslations } from "@/i18n/use-translations";

const STEPS: OrderStatus[] = [
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
];

const ORDER: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
];

export function OrderStepper({ status }: { status: OrderStatus }) {
  const { t } = useTranslations();
  const currentIdx = ORDER.indexOf(status);

  return (
    <div className="flex items-center justify-between gap-1">
      {STEPS.map((stepKey, i) => {
        const stepIdx = ORDER.indexOf(stepKey);
        const done = currentIdx >= stepIdx;
        const active = status === stepKey || (status === "pending" && i === 0);
        return (
          <div key={stepKey} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                done || active
                  ? "bg-accent text-black"
                  : "bg-surface-elevated text-muted"
              }`}
            >
              {done ? "✓" : i + 1}
            </div>
            <span className={`text-[9px] text-center ${done ? "text-accent" : "text-muted"}`}>
              {t(`orders.stepper.${stepKey}`)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
