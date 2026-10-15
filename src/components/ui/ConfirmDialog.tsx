"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/Button";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onOpenChange,
  onConfirm,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0"
          style={{
            zIndex: 100050,
            background: "rgba(24, 24, 27, 0.4)",
            backdropFilter: "blur(6px)",
          }}
        />
        <Dialog.Content
          className="theme-admin fixed overflow-hidden rounded-2xl bg-white text-[#18181b]"
          style={{
            zIndex: 100051,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(24rem, calc(100vw - 1.5rem))",
            border: "1px solid #e4e4e7",
            boxShadow: "0 24px 64px rgba(24, 24, 27, 0.18)",
          }}
        >
          <div className="px-5 pt-5 text-foreground">
            <Dialog.Title className="text-lg font-semibold tracking-tight">
              {title}
            </Dialog.Title>
          </div>
          <Dialog.Description className="px-5 pb-4 pt-1.5 text-sm leading-6 text-muted">
            {description}
          </Dialog.Description>
          <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 bg-zinc-50/60 px-5 py-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              {cancelLabel}
            </Button>
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onConfirm();
              }}
              className="!bg-red-600 !text-white hover:!bg-red-700"
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
