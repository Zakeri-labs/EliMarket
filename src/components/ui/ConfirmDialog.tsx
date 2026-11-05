"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { usePathname } from "next/navigation";
import { cn } from "@/app/utils/cn";
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
  const isAdminRoute = usePathname().startsWith("/dashboard");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn("fixed inset-0", isAdminRoute && "admin-overlay")}
          style={{
            zIndex: 100050,
            ...(isAdminRoute
              ? { background: "rgba(17, 28, 31, 0.5)" }
              : { background: "rgba(24, 24, 27, 0.4)", backdropFilter: "blur(6px)" }),
          }}
        />
        <Dialog.Content
          className={cn(
            "theme-admin fixed overflow-hidden bg-white text-foreground",
            isAdminRoute ? "admin-ui rounded-[18px]" : "rounded-2xl",
          )}
          style={{
            zIndex: 100051,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(24rem, calc(100vw - 1.5rem))",
            ...(isAdminRoute
              ? { boxShadow: "0 24px 48px -12px rgba(17, 28, 31, 0.28)" }
              : { border: "1px solid #e4e4e7", boxShadow: "0 24px 64px rgba(24, 24, 27, 0.18)" }),
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
          <div className="flex flex-col-reverse gap-2 border-t border-border bg-background/60 px-5 py-3 sm:flex-row sm:justify-end">
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
