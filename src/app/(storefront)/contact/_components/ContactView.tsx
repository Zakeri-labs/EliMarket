"use client";

import { useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import {
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { Button } from "@/components/ui/Button";
import { STORE_LOCATION, storeAddressLine, storeGeoUrl } from "@/config/store-location";
import { useNotification } from "@/app/hooks/use-notification";
import { useTranslations } from "@/i18n/use-translations";
import "leaflet/dist/leaflet.css";

const StoreLocationMap = dynamic(
  () => import("@/app/(storefront)/contact/_components/StoreLocationMap"),
  { ssr: false },
);

type Props = {
  phone?: string;
};

const FAQ_ITEMS = [
  { q: "faqDeliveryQ", a: "faqDeliveryA" },
  { q: "faqPaymentQ", a: "faqPaymentA" },
  { q: "faqReturnQ", a: "faqReturnA" },
  { q: "faqHoursQ", a: "faqHoursA" },
] as const;

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function ContactView({ phone = "" }: Props) {
  const { messages: m, locale, dir } = useTranslations();
  const { showSuccess } = useNotification();
  const addressLine = storeAddressLine(locale);
  const mapsUrl = storeGeoUrl();
  const email = STORE_LOCATION.email;
  const telHref = phone ? `tel:${digitsOnly(phone)}` : null;
  const whatsappHref = phone ? `https://wa.me/${digitsOnly(phone)}` : null;

  const [name, setName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !fromEmail.trim() || !message.trim()) return;
    setSending(true);
    const body = [
      message.trim(),
      "",
      `— ${name.trim()}`,
      fromEmail.trim(),
    ].join("\n");
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject.trim() || m.contact.title)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    showSuccess(m.contact.submitSuccess);
    setName("");
    setFromEmail("");
    setSubject("");
    setMessage("");
    window.setTimeout(() => setSending(false), 600);
  };

  const inputClass =
    "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary focus:border-accent";

  return (
    <main dir={dir} className="py-6 md:py-10">
      <header className="mb-8 border-b border-border-subtle pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-teal">
          {STORE_LOCATION.name}
        </p>
        <h1
          className={cn(
            "mt-2 text-3xl font-bold tracking-tight text-text-primary md:text-4xl",
            locale === "en" && "font-logo",
          )}
        >
          {m.contact.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary md:text-base">
          {m.contact.subtitle}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {telHref ? (
          <a
            href={telHref}
            className="rounded-2xl border border-border-subtle bg-bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-accent-teal/40"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-teal/15 text-accent-teal">
              <AppIcon icon={Phone} size="md" />
            </span>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-text-secondary">
              {m.contact.phone}
            </p>
            <p className="mt-1 font-semibold text-text-primary" dir="ltr">
              {phone}
            </p>
          </a>
        ) : null}

        <a
          href={`mailto:${email}`}
          className="rounded-2xl border border-border-subtle bg-bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-accent-teal/40"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-teal/15 text-accent-teal">
            <AppIcon icon={Mail} size="md" />
          </span>
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-text-secondary">
            {m.contact.email}
          </p>
          <p className="mt-1 font-semibold text-text-primary" dir="ltr">
            {email}
          </p>
        </a>

        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-border-subtle bg-bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-accent-teal/40"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-wash-bg text-accent-gold">
              <AppIcon icon={MessageCircle} size="md" />
            </span>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-text-secondary">
              {m.contact.whatsapp}
            </p>
            <p className="mt-1 font-semibold text-text-primary" dir="ltr">
              {phone}
            </p>
          </a>
        ) : null}

        <div className="rounded-2xl border border-border-subtle bg-bg-card p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-wash-bg text-accent-gold">
            <AppIcon icon={Clock} size="md" />
          </span>
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-text-secondary">
            {m.contact.workingHours}
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-text-primary">
            {m.contact.workingHoursValue}
          </p>
          <p className="text-sm text-text-secondary">{m.contact.fridayHours}</p>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "rounded-2xl border border-border-subtle bg-bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-accent-teal/40",
            telHref && whatsappHref ? "sm:col-span-2 xl:col-span-1" : "sm:col-span-2",
          )}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-teal/15 text-accent-teal">
            <AppIcon icon={MapPin} size="md" />
          </span>
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-text-secondary">
            {m.contact.address}
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-text-primary">
            {STORE_LOCATION.name}
            <br />
            {addressLine}
          </p>
        </a>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <form
          onSubmit={submit}
          className="rounded-3xl border border-border-subtle bg-bg-card p-5 sm:p-7"
        >
          <h2 className="text-xl font-bold text-text-primary">{m.contact.sendMessage}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-text-secondary">
                {m.contact.nameLabel}
              </span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={m.contact.namePlaceholder}
                className={inputClass}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-text-secondary">
                {m.contact.emailLabel}
              </span>
              <input
                required
                type="email"
                dir="ltr"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder={m.contact.emailPlaceholder}
                className={inputClass}
              />
            </label>
          </div>
          <label className="mt-4 block text-sm">
            <span className="mb-1.5 block font-medium text-text-secondary">
              {m.contact.subjectLabel}
            </span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={m.contact.subjectPlaceholder}
              className={inputClass}
            />
          </label>
          <label className="mt-4 block text-sm">
            <span className="mb-1.5 block font-medium text-text-secondary">
              {m.contact.messageLabel}
            </span>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={m.contact.messagePlaceholder}
              className={cn(inputClass, "resize-y min-h-32")}
            />
          </label>
          <Button
            type="submit"
            size="lg"
            className="mt-5"
            loading={sending}
            loadingLabel={m.contact.submitBtn}
          >
            <AppIcon icon={Send} size="sm" />
            {m.contact.submitBtn}
          </Button>
        </form>

        <div className="overflow-hidden rounded-3xl border border-border-subtle bg-bg-card">
          <div className="flex items-start justify-between gap-3 px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-text-primary">{m.contact.findUs}</h2>
              <p className="mt-1 text-sm text-text-secondary">{addressLine}</p>
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-teal px-3 py-1.5 text-xs font-bold text-on-accent"
            >
              <AppIcon icon={MapPin} size="xs" />
              {m.blog.viewOnMaps}
            </a>
          </div>
          <StoreLocationMap />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-text-primary">{m.contact.faq}</h2>
        <ul className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <li key={item.q}>
              <details className="group rounded-2xl border border-border-subtle bg-bg-card px-4 py-1 open:border-accent-teal/30">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-semibold text-text-primary [&::-webkit-details-marker]:hidden">
                  {m.contact[item.q]}
                  <AppIcon
                    icon={ChevronDown}
                    size="sm"
                    className="text-text-secondary transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="pb-4 text-sm leading-6 text-text-secondary">
                  {m.contact[item.a]}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
