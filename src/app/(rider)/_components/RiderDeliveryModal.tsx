"use client";

import { useState } from "react";
import { riderMarkDeliveredAction } from "@/app/_actions/rider-actions";
import { useFormAction } from "@/app/hooks/use-form-action";
import { uploadDeliveryProof } from "@/lib/storage/upload-delivery-proof-client";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useTranslations } from "@/i18n/use-translations";
import { DeliveryPhotoField } from "./DeliveryPhotoField";

export function RiderDeliveryModal({
  orderId,
  open,
  onOpenChange,
  onDone,
}: {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const { t } = useTranslations();
  const { runAction, isPending, notifyError } = useFormAction();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const busy = uploading || isPending;

  const close = () => {
    if (busy) return;
    setFile(null);
    onOpenChange(false);
  };

  const submit = async () => {
    if (!file || busy) return;
    setUploading(true);
    let photoPath: string;
    try {
      photoPath = (await uploadDeliveryProof(file, orderId)).path;
    } catch (err) {
      setUploading(false);
      notifyError(err);
      return;
    }
    setUploading(false);
    runAction(() => riderMarkDeliveredAction(orderId, photoPath), {
      successMessage: t("notifications.orderDelivered"),
      onSuccess: () => {
        setFile(null);
        onOpenChange(false);
        onDone();
      },
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      title={t("rider.proof.deliveredTitle")}
      description={t("rider.proof.deliveredDescription")}
      busy={busy}
      busyLabel={uploading ? t("rider.proof.uploading") : t("common.saving")}
      footer={
        <>
          <Button variant="outline" onClick={close} disabled={busy}>
            {t("common.cancel")}
          </Button>
          <Button onClick={submit} loading={busy} disabled={!file}>
            {t("rider.proof.confirmDelivered")}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <DeliveryPhotoField file={file} onChange={setFile} disabled={busy} />
        {!file ? (
          <p className="text-xs text-[#a1a1aa]">{t("rider.proof.photoRequired")}</p>
        ) : null}
      </div>
    </Modal>
  );
}
