import Link from "next/link";
import { getMessages } from "@/i18n/messages";
import { getRequestLocale } from "@/i18n/server";

export default async function NotFound() {
  const locale = await getRequestLocale();
  const meta = getMessages(locale).meta;

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-6xl font-bold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-bold">{meta.notFoundTitle}</h1>
      <p className="mt-2 max-w-md text-sm text-muted">{meta.notFoundMessage}</p>
      <Link
        href="/"
        className="mt-8 rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-background transition hover:bg-accent-dark"
      >
        {meta.backToHome}
      </Link>
    </main>
  );
}
