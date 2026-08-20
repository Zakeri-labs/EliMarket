"use client";

import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useTranslations } from "@/i18n/use-translations";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: ModalSize;
  footer?: ReactNode;
};

const SIZE_WIDTH: Record<ModalSize, string> = {
  sm: "28rem",
  md: "32rem",
  lg: "42rem",
  xl: "56rem",
  full: "80rem",
};

/** Port of mehregan-front AdvancedModal — centered, themed border, body scroll. */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
  footer,
}: ModalProps) {
  const { t } = useTranslations();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0"
          style={{
            zIndex: 100000,
            background: "rgba(15, 23, 18, 0.55)",
            backdropFilter: "blur(6px)",
          }}
        />
        <Dialog.Content
          className="fixed overflow-hidden rounded-2xl bg-white text-[#18181b]"
          style={{
            zIndex: 100001,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: `min(${SIZE_WIDTH[size]}, calc(100vw - 1.5rem))`,
            maxHeight: "min(88dvh, 52rem)",
            display: "grid",
            gridTemplateRows: footer ? "auto minmax(0, 1fr) auto" : "auto minmax(0, 1fr)",
            border: "1px solid #6b8f71",
            boxShadow: "0 24px 60px rgba(82, 117, 89, 0.22)",
          }}
        >
          <div className="flex shrink-0 items-start justify-between gap-2 border-b border-[#6b8f71]/30 bg-[#6b8f71] px-4 py-3 text-white">
            <div className="min-w-0 flex-1 pe-1">
              <Dialog.Title className="text-lg font-semibold tracking-tight sm:text-xl">
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-sm text-white/90">
                  {description}
                </Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{title}</Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-white/15"
                aria-label={t("table.close")}
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div
            className="app-modal-scroll min-h-0 overflow-y-auto overscroll-contain px-4 py-3"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#6b8f71 #f4f4f5" }}
          >
            {children}
          </div>

          {footer ? (
            <div className="flex shrink-0 flex-col gap-2 border-t border-[#6b8f71]/25 bg-[#fafafa] px-4 py-3 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3 [&_button]:w-full sm:[&_button]:w-auto sm:[&_button]:min-w-32">
              {footer}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
