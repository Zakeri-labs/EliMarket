"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/app/_store/locale-store";
import { getDirection } from "@/i18n/config";

const SCROLL_STYLE_ID = "elimarket-admin-scroll-style";

const ADMIN_SCROLL_CSS = `
.admin-thin-scroll,
.app-modal-scroll {
  scrollbar-width: thin;
  scrollbar-color: #6b8f71 #f4f4f5;
}
.admin-thin-scroll::-webkit-scrollbar,
.app-modal-scroll::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.admin-thin-scroll::-webkit-scrollbar-button,
.app-modal-scroll::-webkit-scrollbar-button {
  display: none;
  width: 0;
  height: 0;
}
.admin-thin-scroll::-webkit-scrollbar-track,
.app-modal-scroll::-webkit-scrollbar-track {
  background: #f4f4f5;
}
.admin-thin-scroll::-webkit-scrollbar-thumb,
.app-modal-scroll::-webkit-scrollbar-thumb {
  background: #6b8f71;
  border-radius: 8px;
}
.admin-thin-scroll::-webkit-scrollbar-thumb:hover,
.app-modal-scroll::-webkit-scrollbar-thumb:hover {
  background: #527559;
}
`;

export function AdminDirRoot({ children }: { children: React.ReactNode }) {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    if (!document.getElementById(SCROLL_STYLE_ID)) {
      const style = document.createElement("style");
      style.id = SCROLL_STYLE_ID;
      style.textContent = ADMIN_SCROLL_CSS;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div
      dir={getDirection(locale)}
      className="theme-admin flex h-[100dvh] max-h-[100dvh] min-h-0 flex-1 flex-col overflow-hidden bg-[#f4f4f5] text-[#18181b]"
    >
      {children}
    </div>
  );
}
