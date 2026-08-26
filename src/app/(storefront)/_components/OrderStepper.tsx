"use client";

import type { OrderStatus } from "@/app/_types/database.types";
import { Check, X } from "lucide-react";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
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
  const currentIdx = ORDER.indexOf(status === "cancelled" ? "pending" : status);

  return (
    <ol className="flex w-full items-start">
      {STEPS.map((stepKey, i) => {
        const stepIdx = ORDER.indexOf(stepKey);
        const done = currentIdx > stepIdx;
        const active =
          currentIdx === stepIdx || (status === "pending" && stepKey === "confirmed");
        const reached = done || active;
        const lineReached = currentIdx > stepIdx;

        return (
          <li key={stepKey} className="relative flex flex-1 flex-col items-center">
            {i < STEPS.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-3.5 start-1/2 h-0.5 w-full md:top-[1.125rem]",
                  lineReached ? "bg-accent-teal" : "bg-border-subtle",
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative z-[1] flex h-7 w-7 items-center justify-center rounded-full border-2 md:h-9 md:w-9",
                reached
                  ? "border-accent-teal bg-accent-teal text-on-accent"
                  : "border-border-subtle bg-bg-card text-text-secondary",
              )}
            >
              {reached ? <AppIcon icon={Check} size="xs" /> : <AppIcon icon={X} size="xs" />}
            </span>
            <span
              className={cn(
                "mt-2 max-w-[4.75rem] text-center text-[10px] leading-tight md:max-w-[6.5rem] md:text-xs",
                reached ? "font-medium text-accent-teal" : "text-text-secondary",
              )}
            >
              {t(`orders.stepper.${stepKey}`)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
