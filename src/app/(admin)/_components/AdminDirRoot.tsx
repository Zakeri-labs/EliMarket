"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/app/_store/locale-store";
import { getDirection } from "@/i18n/config";

const SCROLL_STYLE_ID = "elimarket-admin-scroll-style";

const ADMIN_SCROLL_CSS = `
html.admin-lock-scroll,
html.admin-lock-scroll body,
body.admin-lock-scroll {
  height: 100% !important;
  max-height: 100dvh !important;
  overflow: hidden !important;
  overscroll-behavior: none !important;
}
.admin-page-scroll {
  flex: 1 1 0%;
  min-height: 0;
  height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.admin-thin-scroll,
.app-modal-scroll,
.admin-page-scroll {
  scrollbar-width: thin;
  scrollbar-color: #0d9488 #f4f4f5;
}
.admin-thin-scroll::-webkit-scrollbar,
.app-modal-scroll::-webkit-scrollbar,
.admin-page-scroll::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.admin-thin-scroll::-webkit-scrollbar-button,
.app-modal-scroll::-webkit-scrollbar-button,
.admin-page-scroll::-webkit-scrollbar-button {
  display: none;
  width: 0;
  height: 0;
}
.admin-thin-scroll::-webkit-scrollbar-track,
.app-modal-scroll::-webkit-scrollbar-track,
.admin-page-scroll::-webkit-scrollbar-track {
  background: #f4f4f5;
}
.admin-thin-scroll::-webkit-scrollbar-thumb,
.app-modal-scroll::-webkit-scrollbar-thumb,
.admin-page-scroll::-webkit-scrollbar-thumb {
  background: #0d9488;
  border-radius: 8px;
}
.admin-thin-scroll::-webkit-scrollbar-thumb:hover,
.app-modal-scroll::-webkit-scrollbar-thumb:hover,
.admin-page-scroll::-webkit-scrollbar-thumb:hover {
  background: #0f766e;
}
`;

export function AdminDirRoot({ children }: { children: React.ReactNode }) {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height,
      htmlMaxHeight: html.style.maxHeight,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
      bodyMaxHeight: body.style.maxHeight,
    };

    html.classList.add("admin-lock-scroll");
    body.classList.add("admin-lock-scroll");
    html.style.overflow = "hidden";
    html.style.height = "100dvh";
    html.style.maxHeight = "100dvh";
    body.style.overflow = "hidden";
    body.style.height = "100dvh";
    body.style.maxHeight = "100dvh";

    let style = document.getElementById(SCROLL_STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = SCROLL_STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = ADMIN_SCROLL_CSS;

    return () => {
      html.classList.remove("admin-lock-scroll");
      body.classList.remove("admin-lock-scroll");
      html.style.overflow = prev.htmlOverflow;
      html.style.height = prev.htmlHeight;
      html.style.maxHeight = prev.htmlMaxHeight;
      body.style.overflow = prev.bodyOverflow;
      body.style.height = prev.bodyHeight;
      body.style.maxHeight = prev.bodyMaxHeight;
    };
  }, []);

  return (
    <div
      dir={getDirection(locale)}
      className="theme-admin fixed inset-0 z-0 flex flex-col overflow-hidden bg-[#f4f4f5] text-[#18181b]"
    >
      {children}
    </div>
  );
}
