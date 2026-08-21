"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { AppIcon } from "@/components/icons/AppIcon";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  editLabel: string;
  deleteLabel: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function RowIconActions({ editLabel, deleteLabel, onEdit, onDelete }: Props) {
  const { t } = useTranslations();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex items-center gap-1">
      {onEdit ? (
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#527559] transition-colors hover:bg-[#6b8f71]/12"
          aria-label={editLabel}
          title={editLabel}
          onClick={onEdit}
        >
          <AppIcon icon={Pencil} size="sm" />
        </button>
      ) : null}
      {onDelete ? (
        <>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50"
            aria-label={deleteLabel}
            title={deleteLabel}
            onClick={() => setConfirmOpen(true)}
          >
            <AppIcon icon={Trash2} size="sm" />
          </button>
          <ConfirmDialog
            open={confirmOpen}
            title={t("common.confirmDeleteTitle")}
            description={t("common.confirmDelete")}
            confirmLabel={deleteLabel}
            cancelLabel={t("common.cancel")}
            onOpenChange={setConfirmOpen}
            onConfirm={onDelete}
          />
        </>
      ) : null}
    </div>
  );
}
