"use client";

import { useState } from "react";
import { riderMarkUndeliveredAction } from "@/app/_actions/rider-actions";
import { useFormAction } from "@/app/hooks/use-form-action";
import { uploadDeliveryProof } from "@/lib/storage/upload-delivery-proof-client";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useTranslations } from "@/i18n/use-translations";
import type { FailedDeliveryReason } from "@/app/_types/database.types";
import { DeliveryPhotoField } from "./DeliveryPhotoField";

const REASONS: FailedDeliveryReason[] = [
  "customer_absent",
  "no_answer",
  "wrong_address",
  "customer_refused",
  "other",
];

export function RiderUndeliveredModal({
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
  const [reason, setReason] = useState<FailedDeliveryReason | null>(null);
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const busy = uploading || isPending;

  const noteMissing = reason === "other" && !note.trim();
  const canSubmit = !!reason && !!file && !noteMissing;

  const reset = () => {
    setReason(null);
    setNote("");
    setFile(null);
  };

  const close = () => {
    if (busy) return;
    reset();
    onOpenChange(false);
  };

  const submit = async () => {
    if (!canSubmit || !reason || !file || busy) return;
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
    runAction(
      () =>
        riderMarkUndeliveredAction(orderId, {
          reason,
          note: note.trim() || undefined,
          photoPath,
        }),
      {
        successMessage: t("notifications.orderReturned"),
        onSuccess: () => {
          reset();
          onOpenChange(false);
          onDone();
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      title={t("rider.undelivered.title")}
      description={t("rider.undelivered.description")}
      busy={busy}
      busyLabel={uploading ? t("rider.proof.uploading") : t("common.saving")}
      footer={
        <>
          <Button variant="outline" onClick={close} disabled={busy}>
            {t("common.cancel")}
          </Button>
          <Button onClick={submit} loading={busy} disabled={!canSubmit}>
            {t("rider.undelivered.submit")}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium text-[#3f3f46]">
            {t("rider.undelivered.reasonLabel")}
          </legend>
          {REASONS.map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm has-[:checked]:border-[#0d9488] has-[:checked]:bg-[#0d9488]/5"
            >
              <input
                type="radio"
                name="undelivered-reason"
                value={key}
                checked={reason === key}
                onChange={() => setReason(key)}
                disabled={busy}
                className="accent-[#0d9488]"
              />
              <span>{t(`rider.undelivered.reasons.${key}`)}</span>
            </label>
          ))}
        </fieldset>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#3f3f46]">
            {t("rider.undelivered.noteLabel")}
            {reason === "other" ? <span className="text-red-600"> *</span> : null}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={busy}
            rows={3}
            placeholder={t("rider.undelivered.notePlaceholder")}
            className="w-full rounded-xl border border-[#e4e4e7] bg-[#fafafa] px-3 py-2 text-sm outline-none focus:border-[#0f766e]"
          />
          {noteMissing ? (
            <p className="mt-1 text-xs text-red-600">
              {t("rider.undelivered.noteRequired")}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#3f3f46]">
            {t("rider.undelivered.photoLabel")}
          </label>
          <DeliveryPhotoField file={file} onChange={setFile} disabled={busy} />
          {!file ? (
            <p className="mt-1 text-xs text-[#a1a1aa]">
              {t("rider.proof.photoRequired")}
            </p>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
