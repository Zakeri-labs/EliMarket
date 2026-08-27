"use client";

import { useState } from "react";
import { riderMarkPickedUpAction } from "@/app/_actions/rider-actions";
import { useFormAction } from "@/app/hooks/use-form-action";
import { Button } from "@/components/ui/Button";
import { getNumberLocale } from "@/i18n/config";
import { useTranslations } from "@/i18n/use-translations";
import type { Order } from "@/app/_types/database.types";
import { RiderDeliveryModal } from "./RiderDeliveryModal";
import { RiderUndeliveredModal } from "./RiderUndeliveredModal";

export function AssignedOrderActions({
  order,
  onChanged,
}: {
  order: Order;
  onChanged: () => void;
}) {
  const { t, locale } = useTranslations();
  const { runAction, isPending } = useFormAction();
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [failOpen, setFailOpen] = useState(false);

  if (!order.picked_up_at) {
    return (
      <div className="w-full space-y-2">
        <p className="text-xs text-muted">{t("rider.pickupHint")}</p>
        <Button
          type="button"
          fullWidth
          loading={isPending}
          loadingLabel={t("common.saving")}
          onClick={() =>
            runAction(() => riderMarkPickedUpAction(order.id), {
              successMessage: t("notifications.orderPickedUp"),
              onSuccess: onChanged,
            })
          }
        >
          {t("rider.markPickedUp")}
        </Button>
      </div>
    );
  }

  const pickedTime = new Date(order.picked_up_at).toLocaleTimeString(
    getNumberLocale(locale),
    { hour: "2-digit", minute: "2-digit" },
  );

  return (
    <div className="w-full space-y-2">
      <p className="text-xs text-muted">
        {t("rider.pickedUpAt", { time: pickedTime })}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="flex-1"
          onClick={() => setDeliverOpen(true)}
        >
          {t("rider.markDelivered")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => setFailOpen(true)}
        >
          {t("rider.markUndelivered")}
        </Button>
      </div>

      <RiderDeliveryModal
        orderId={order.id}
        open={deliverOpen}
        onOpenChange={setDeliverOpen}
        onDone={onChanged}
      />
      <RiderUndeliveredModal
        orderId={order.id}
        open={failOpen}
        onOpenChange={setFailOpen}
        onDone={onChanged}
      />
    </div>
  );
}
