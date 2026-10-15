"use client";

import { useTranslations } from "@/i18n/use-translations";

/** Mock-up headline: bold white Playfair first part, italic cream serif for the rest. */
export function HeroTitle({ title }: { title: string }) {
  const { locale } = useTranslations();
  const cut = locale === "en" ? title.indexOf(",") : -1;
  if (cut === -1) {
    return (
      <h2
        className={
          locale === "en"
            ? "mt-1 w-full max-w-xl text-start text-[clamp(30px,4.2vw,64px)] font-bold leading-[0.95] tracking-tight text-white"
            : "mt-1 w-full max-w-lg text-start text-2xl font-bold leading-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] sm:text-3xl md:text-4xl"
        }
        style={locale === "en" ? { fontFamily: "var(--font-playfair), serif" } : undefined}
      >
        {title}
      </h2>
    );
  }
  const head = title.slice(0, cut + 1).trim();
  const tail = title.slice(cut + 1).trim();
  return (
    <h2 className="mt-1 w-full max-w-xl text-start" style={{ fontFamily: "var(--font-playfair), serif" }}>
      <span className="block text-[clamp(30px,4.2vw,64px)] font-bold leading-[0.95] tracking-tight text-white">
        {head}
      </span>
      {tail ? (
        <span
          className="mt-1 block text-[clamp(30px,4.2vw,64px)] font-medium italic leading-[1.05] text-[#e8c99b]"
          style={{ fontFamily: "var(--font-cormorant), var(--font-playfair), serif" }}
        >
          {tail}
        </span>
      ) : null}
    </h2>
  );
}
