"use client";

import { useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  AlertCircle,
  ChevronDown,
  CreditCard,
  Mail,
  MessageSquare,
  RotateCcw,
  ShoppingBasket,
  Truck,
} from "lucide-react";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { Button } from "@/components/ui/Button";
import {
  STORE_LOCATION,
  isStoreOpenNow,
  storeAddressLine,
  storeGeoUrl,
} from "@/config/store-location";
import { useNotification } from "@/app/hooks/use-notification";
import { useTranslations } from "@/i18n/use-translations";
import type { Messages } from "@/i18n/messages";
import "leaflet/dist/leaflet.css";

const StoreLocationMap = dynamic(
  () => import("@/app/(storefront)/contact/_components/StoreLocationMap"),
  { ssr: false },
);

type Props = {
  phone?: string;
};

type ContactKey = keyof Messages["contact"];

const FAQ_ITEMS = [
  { q: "faqDeliveryQ", a: "faqDeliveryA" },
  { q: "faqPaymentQ", a: "faqPaymentA" },
  { q: "faqReturnQ", a: "faqReturnA" },
  { q: "faqHoursQ", a: "faqHoursA" },
] as const;

const TOPICS: { key: ContactKey; noteKey: ContactKey; icon: typeof Truck }[] = [
  { key: "topicOrderIssue", noteKey: "topicOrderIssueNote", icon: AlertCircle },
  { key: "topicDelivery", noteKey: "topicDeliveryNote", icon: Truck },
  { key: "topicReturns", noteKey: "topicReturnsNote", icon: RotateCcw },
  { key: "topicProduct", noteKey: "topicProductNote", icon: ShoppingBasket },
  { key: "topicPayment", noteKey: "topicPaymentNote", icon: CreditCard },
  { key: "topicOther", noteKey: "topicOtherNote", icon: MessageSquare },
];

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

const fieldClass =
  "w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-faint focus:border-accent-teal";

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
  const [mobile, setMobile] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");
  const [topic, setTopic] = useState<ContactKey | null>(null);
  const [sendCopy, setSendCopy] = useState(false);
  const [sending, setSending] = useState(false);
  const [openNow] = useState(() => isStoreOpenNow());

  const resetForm = () => {
    setName("");
    setFromEmail("");
    setMobile("");
    setOrderNumber("");
    setMessage("");
    setTopic(null);
    setSendCopy(false);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !fromEmail.trim() || !message.trim()) return;
    setSending(true);

    const detailLines = [
      topic ? `${m.contact.subjectLabel}: ${m.contact[topic]}` : null,
      mobile.trim() ? `${m.contact.mobileLabel}: +968 ${mobile.trim()}` : null,
      orderNumber.trim() ? `${m.contact.orderNumberLabel}: ${orderNumber.trim()}` : null,
    ].filter((line): line is string => line !== null);

    const body = [
      ...detailLines,
      ...(detailLines.length ? [""] : []),
      message.trim(),
      "",
      `— ${name.trim()}`,
      fromEmail.trim(),
    ].join("\n");

    const params = new URLSearchParams({ subject: m.contact.title, body });
    if (sendCopy) params.set("cc", fromEmail.trim());
    window.location.href = `mailto:${email}?${params.toString()}`;

    showSuccess(m.contact.submitSuccess);
    resetForm();
    window.setTimeout(() => setSending(false), 600);
  };

  return (
    <main dir={dir} className="py-8 md:py-12">
      <header className="flex flex-col gap-6 border-b border-border-subtle pb-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-faint">
            {m.contact.heroEyebrow}
          </p>
          <h1
            className={cn(
              "mt-3 text-3xl font-semibold leading-tight tracking-tight text-text-primary md:text-4xl",
              locale === "en" && "font-logo",
            )}
          >
            {m.contact.heroHeadline}
          </h1>
          <p className="mt-3 text-sm leading-6 text-text-secondary">{m.contact.heroDescription}</p>
        </div>

        {(whatsappHref || telHref) && (
          <div className="flex shrink-0 gap-3">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-[170px] flex-col gap-1 rounded-2xl border border-accent-teal/30 bg-accent-teal/10 px-4 py-3 transition-colors hover:border-accent-teal/50"
              >
                <span className="text-[10px] font-medium uppercase tracking-wide text-text-faint">
                  {m.contact.whatsappHotlineLabel}
                </span>
                <span className="font-mono text-base font-bold text-accent-teal" dir="ltr">
                  {phone}
                </span>
                <span className="text-[11px] text-text-faint">{m.contact.whatsappHotlineNote}</span>
              </a>
            ) : null}
            {telHref ? (
              <a
                href={telHref}
                className="flex min-w-[170px] flex-col gap-1 rounded-2xl border border-gold-wash-border bg-gold-wash-bg px-4 py-3 transition-colors hover:border-accent-gold/50"
              >
                <span className="text-[10px] font-medium uppercase tracking-wide text-text-faint">
                  {m.contact.callHotlineLabel}
                </span>
                <span className="font-mono text-base font-bold text-accent-gold" dir="ltr">
                  {phone}
                </span>
                <span className="text-[11px] text-text-faint">{m.contact.callHotlineNote}</span>
              </a>
            ) : null}
          </div>
        )}
      </header>

      <section className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-faint">
              {m.contact.topicsLabel}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {TOPICS.map((item) => {
                const active = topic === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTopic(active ? null : item.key)}
                    aria-pressed={active}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-start transition-colors",
                      active
                        ? "border-accent-teal/50 bg-accent-teal/10"
                        : "border-border-subtle bg-bg-card hover:border-border",
                    )}
                  >
                    <AppIcon
                      icon={item.icon}
                      size="sm"
                      className={cn("shrink-0", active ? "text-accent-teal" : "text-text-faint")}
                    />
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block text-xs font-semibold",
                          active ? "text-accent-teal" : "text-text-primary",
                        )}
                      >
                        {m.contact[item.key]}
                      </span>
                      <span className="block truncate text-[11px] text-text-faint">
                        {m.contact[item.noteKey]}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={submit} className="rounded-2xl border border-border-subtle bg-bg-card p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h2 className="text-base font-medium text-text-primary">{m.contact.sendMessage}</h2>
              <span className="text-xs text-text-faint">{m.contact.formNote}</span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs text-text-secondary">{m.contact.nameLabel}</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={m.contact.namePlaceholder}
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs text-text-secondary">{m.contact.mobileLabel}</span>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-3.5 focus-within:border-accent-teal">
                  <span className="text-xs text-text-faint" dir="ltr">
                    +968
                  </span>
                  <input
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder={m.contact.mobilePlaceholder}
                    dir="ltr"
                    className="w-full bg-transparent py-2.5 text-sm text-text-primary outline-none placeholder:text-text-faint"
                  />
                </div>
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs text-text-secondary">{m.contact.emailLabel}</span>
                <input
                  required
                  type="email"
                  dir="ltr"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder={m.contact.emailPlaceholder}
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs text-text-secondary">
                  {m.contact.orderNumberLabel}
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-3.5">
                  <input
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder={m.contact.orderNumberPlaceholder}
                    className="w-full bg-transparent py-2.5 text-sm text-text-primary outline-none placeholder:text-text-faint"
                  />
                  <Link
                    href="/orders"
                    target="_blank"
                    className="shrink-0 text-xs text-accent-teal hover:underline"
                  >
                    {m.contact.findOrderLink}
                  </Link>
                </div>
              </label>
            </div>

            <label className="mt-4 block text-sm">
              <span className="mb-1.5 block text-xs text-text-secondary">{m.contact.messageLabel}</span>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={m.contact.messagePlaceholder}
                className={cn(fieldClass, "resize-none")}
              />
            </label>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-text-secondary">
                <input
                  type="checkbox"
                  checked={sendCopy}
                  onChange={(e) => setSendCopy(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-accent-teal"
                />
                {m.contact.sendCopyLabel}
              </label>
              <div className="ms-auto flex items-center gap-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-text-faint hover:text-text-primary"
                >
                  {m.contact.clearBtn}
                </button>
                <Button type="submit" size="md" loading={sending} loadingLabel={m.contact.submitBtn}>
                  {m.contact.submitBtn}
                </Button>
              </div>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-5">
          <div className="overflow-hidden rounded-2xl border border-gold-wash-border bg-bg-card">
            <StoreLocationMap className="h-40 w-full" />
            <div className="flex flex-col gap-3 p-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-faint">
                {m.contact.flagshipStoreLabel}
              </p>
              <div>
                <p className="text-sm font-semibold text-text-primary">{STORE_LOCATION.name}</p>
                <p className="mt-0.5 text-xs leading-5 text-text-secondary">{addressLine}</p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs text-accent-teal hover:underline"
                >
                  {m.blog.viewOnMaps}
                </a>
              </div>
              <div className="border-t border-border-subtle pt-3 text-xs leading-6 text-text-secondary">
                <p>{m.contact.workingHoursValue}</p>
                <p>{m.contact.fridayHours}</p>
                <p className="mt-1 text-text-faint">{m.contact.deliveryCutoffValue}</p>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
                  openNow ? "bg-accent-teal/10 text-accent-teal" : "bg-surface-elevated text-text-faint",
                )}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                {openNow ? m.contact.openNowBadge : m.contact.closedNowBadge}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-bg-card p-4">
            <p className="pb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-text-faint">
              {m.contact.otherWaysLabel}
            </p>
            <div className="divide-y divide-border-subtle">
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3 py-2.5 transition-colors hover:text-accent-teal"
              >
                <AppIcon icon={Mail} size="sm" className="shrink-0 text-text-faint" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-text-primary" dir="ltr">
                    {email}
                  </span>
                  <span className="block text-[11px] text-text-faint">{m.contact.emailChannelNote}</span>
                </span>
              </a>
              <Link
                href="/orders"
                className="flex items-center gap-3 py-2.5 transition-colors hover:text-accent-teal"
              >
                <AppIcon icon={Truck} size="sm" className="shrink-0 text-text-faint" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-text-primary">
                    {m.contact.trackOrderChannelTitle}
                  </span>
                  <span className="block text-[11px] text-text-faint">
                    {m.contact.trackOrderChannelNote}
                  </span>
                </span>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-gold-wash-border bg-gold-wash-bg p-4">
            <p className="text-sm font-semibold text-accent-gold">{m.contact.wholesaleTitle}</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">{m.contact.wholesaleBody}</p>
            <a
              href={`mailto:${email}`}
              className="mt-2 inline-block text-xs font-medium text-accent-gold hover:underline"
              dir="ltr"
            >
              {m.contact.wholesaleCta} · {email}
            </a>
          </div>
        </div>
      </section>

      <section className="mt-16 max-w-2xl">
        <h2 className="text-base font-medium text-text-primary">{m.contact.faq}</h2>
        <ul className="mt-4 divide-y divide-border-subtle border-y border-border-subtle">
          {FAQ_ITEMS.map((item) => (
            <li key={item.q}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 text-sm text-text-primary [&::-webkit-details-marker]:hidden">
                  {m.contact[item.q]}
                  <AppIcon
                    icon={ChevronDown}
                    size="xs"
                    className="shrink-0 text-text-faint transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="pb-4 text-sm leading-6 text-text-secondary">{m.contact[item.a]}</p>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
