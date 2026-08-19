"use client";

import { useLocaleStore } from "@/app/_store/locale-store";
import { getDirection } from "@/i18n/config";

export function AdminDirRoot({ children }: { children: React.ReactNode }) {
  const locale = useLocaleStore((s) => s.locale);

  return (
    <div
      dir={getDirection(locale)}
      className="theme-admin flex min-h-full flex-1 flex-col bg-[#f4f4f5] text-[#18181b]"
    >
      {children}
    </div>
  );
}
