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
            background: "rgba(15, 23, 18, 0.55)",
            backdropFilter: "blur(6px)",
          }}
        />
        <Dialog.Content
          className="fixed overflow-hidden rounded-2xl bg-white text-[#18181b]"
          style={{
            zIndex: 100051,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(24rem, calc(100vw - 1.5rem))",
            border: "1px solid #6b8f71",
            boxShadow: "0 24px 60px rgba(82, 117, 89, 0.22)",
          }}
        >
          <div className="border-b border-[#6b8f71]/30 bg-[#6b8f71] px-4 py-3 text-white">
            <Dialog.Title className="text-lg font-semibold tracking-tight">
              {title}
            </Dialog.Title>
          </div>
          <Dialog.Description className="px-4 py-4 text-sm leading-6 text-[#3f3f46]">
            {description}
          </Dialog.Description>
          <div className="flex flex-col-reverse gap-2 border-t border-[#6b8f71]/25 bg-[#fafafa] px-4 py-3 sm:flex-row sm:justify-end">
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
