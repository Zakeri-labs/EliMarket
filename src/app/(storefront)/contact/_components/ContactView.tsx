"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { ChevronDown, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
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

function ContactRow({
  icon,
  label,
  children,
  iconClassName,
}: {
  icon: typeof Phone;
  label: string;
  children: ReactNode;
  iconClassName?: string;
}) {
  return (
    <div className="flex gap-3 py-3">
      <AppIcon
        icon={icon}
        size="sm"
        className={cn("mt-0.5 shrink-0", iconClassName ?? "text-text-faint")}
      />
      <div className="min-w-0">
        <p className="text-xs text-text-secondary">{label}</p>
        <div className="mt-0.5 text-sm text-text-primary">{children}</div>
      </div>
    </div>
  );
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
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !fromEmail.trim() || !message.trim()) return;
    setSending(true);
    const body = [message.trim(), "", `— ${name.trim()}`, fromEmail.trim()].join("\n");
    const mailto = `mailto:${email}?subject=${encodeURIComponent(m.contact.title)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    showSuccess(m.contact.submitSuccess);
    setName("");
    setFromEmail("");
    setMessage("");
    window.setTimeout(() => setSending(false), 600);
  };

  const fieldClass =
    "w-full border-b border-border bg-transparent py-2.5 text-sm text-text-primary outline-none placeholder:text-text-faint focus:border-text-primary";

  return (
    <main dir={dir} className="py-8 md:py-12">
      <header className="max-w-xl">
        <h1
          className={cn(
            "text-3xl font-semibold tracking-tight text-text-primary md:text-4xl",
            locale === "en" && "font-logo",
          )}
        >
          {m.contact.title}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">{m.contact.subtitle}</p>
      </header>

      <section className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="divide-y divide-border-subtle border-y border-border-subtle">
          {telHref ? (
            <ContactRow icon={Phone} label={m.contact.phone}>
              <a href={telHref} className="hover:text-accent-teal" dir="ltr">
                {phone}
              </a>
            </ContactRow>
          ) : null}
          <ContactRow icon={Mail} label={m.contact.email} iconClassName="text-accent-teal">
            <a href={`mailto:${email}`} className="hover:text-accent-teal" dir="ltr">
              {email}
            </a>
          </ContactRow>
          {whatsappHref ? (
            <ContactRow icon={MessageCircle} label={m.contact.whatsapp}>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent-teal"
                dir="ltr"
              >
                {phone}
              </a>
            </ContactRow>
          ) : null}
          <ContactRow icon={Clock} label={m.contact.workingHours} iconClassName="text-accent-teal">
            <p>{m.contact.workingHoursValue}</p>
            <p className="text-text-secondary">{m.contact.fridayHours}</p>
          </ContactRow>
          <ContactRow icon={MapPin} label={m.contact.address} iconClassName="text-accent-teal">
            <p>{addressLine}</p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-xs text-text-secondary hover:text-text-primary"
            >
              {m.blog.viewOnMaps}
            </a>
          </ContactRow>
        </div>

        <div className="overflow-hidden rounded-xl">
          <StoreLocationMap className="h-64 lg:h-full" />
        </div>
      </section>

      <section className="mt-16 max-w-xl">
        <h2 className="text-base font-medium text-text-primary">{m.contact.sendMessage}</h2>
        <form onSubmit={submit} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="sr-only">{m.contact.nameLabel}</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={m.contact.namePlaceholder}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="sr-only">{m.contact.emailLabel}</span>
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
          </div>
          <label className="block">
            <span className="sr-only">{m.contact.messageLabel}</span>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={m.contact.messagePlaceholder}
              className={cn(fieldClass, "resize-none")}
            />
          </label>
          <Button type="submit" size="md" loading={sending} loadingLabel={m.contact.submitBtn}>
            {m.contact.submitBtn}
          </Button>
        </form>
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
