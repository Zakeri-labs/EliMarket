"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getOrderByIdAction } from "@/app/_actions/order-actions";
import { getStoreSettingsAction } from "@/app/_actions/settings-actions";
import { BRAND_NAME } from "@/config/brand";
import { getDirection, getNumberLocale } from "@/i18n/config";
import { useTranslations } from "@/i18n/use-translations";
import { Price } from "@/components/ui/Price";
import type { Order, StoreSettings } from "@/app/_types/database.types";
import { resolveProductName } from "@/lib/i18n/product-name";

type Width = "58" | "80";
const WIDTH_KEY = "elimarket-receipt-width";

function readStoredWidth(): Width {
  if (typeof window === "undefined") return "80";
  try {
    const v = window.localStorage.getItem(WIDTH_KEY);
    return v === "58" || v === "80" ? v : "80";
  } catch {
    return "80";
  }
}

export default function OrderInvoiceClient({ orderId }: { orderId: string }) {
  const { t, locale } = useTranslations();
  const dir = getDirection(locale);

  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [width, setWidth] = useState<Width>("80");
  const printedRef = useRef(false);

  useEffect(() => {
    // One-time client-only read of the admin's saved paper-size preference.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWidth(readStoredWidth());
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [orderRes, settingsRes] = await Promise.all([
        getOrderByIdAction(orderId),
        getStoreSettingsAction(),
      ]);
      if (!active) return;
      if (settingsRes.data) setSettings(settingsRes.data);
      if (orderRes.success && orderRes.data) setOrder(orderRes.data);
      else setError(orderRes.error ?? t("receipt.notFound"));
    })();
    return () => {
      active = false;
    };
  }, [orderId, t]);

  // Auto-open the print dialog once the receipt has rendered with data.
  useEffect(() => {
    if (!order || !settings || printedRef.current) return;
    printedRef.current = true;
    const id = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(id);
  }, [order, settings]);

  const setAndStoreWidth = (next: Width) => {
    setWidth(next);
    try {
      window.localStorage.setItem(WIDTH_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const pick = (fa: string | null, ar: string | null, en: string | null) =>
    (locale === "ar" ? ar : locale === "en" ? en : fa)?.trim() || "";

  const store = useMemo(() => {
    if (!settings) return null;
    return {
      name:
        pick(
          settings.receipt_store_name_fa,
          settings.receipt_store_name_ar,
          settings.receipt_store_name_en,
        ) || BRAND_NAME,
      address: pick(
        settings.receipt_store_address_fa,
        settings.receipt_store_address_ar,
        settings.receipt_store_address_en,
      ),
      phone: settings.receipt_store_phone?.trim() || "",
      footer:
        pick(
          settings.receipt_footer_fa,
          settings.receipt_footer_ar,
          settings.receipt_footer_en,
        ) || t("receipt.thankYou"),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, locale, t]);

  const totals = useMemo(() => {
    if (!order) return null;
    const subtotal = (order.order_items ?? []).reduce(
      (sum, item) => sum + Number(item.unit_price) * item.quantity,
      0,
    );
    const cashFee = Number(order.cash_fee ?? 0);
    const grand = Number(order.total);
    const deliveryAndVat = Math.max(0, grand - subtotal - cashFee);
    return { subtotal, cashFee, deliveryAndVat, grand };
  }, [order]);

  const printCss = `
    @page { size: ${width}mm auto; margin: 3mm; }
    @media print {
      html, body { background: #fff !important; margin: 0 !important; }
      .receipt-toolbar { display: none !important; }
      .receipt-sheet { box-shadow: none !important; margin: 0 !important; padding: 0 !important; background: #fff !important; }
      .receipt { width: auto !important; }
    }
  `;

  return (
    <div dir={dir} className="min-h-dvh bg-neutral-200 px-3 py-6 print:bg-white">
      <style dangerouslySetInnerHTML={{ __html: printCss }} />

      <div className="receipt-toolbar mx-auto mb-4 flex max-w-md flex-wrap items-center justify-between gap-3">
        <div className="inline-flex overflow-hidden rounded-lg border border-neutral-400">
          {(["58", "80"] as Width[]).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setAndStoreWidth(w)}
              className={
                "px-3 py-1.5 text-sm font-medium " +
                (width === w
                  ? "bg-neutral-800 text-white"
                  : "bg-white text-neutral-700")
              }
            >
              {w} mm
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          disabled={!order}
          className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {t("receipt.print")}
        </button>
      </div>

      {error ? (
        <p className="mx-auto max-w-md rounded-lg bg-white p-4 text-center text-sm text-red-600">
          {error}
        </p>
      ) : !order || !store || !totals ? (
        <p className="mx-auto max-w-md p-4 text-center text-sm text-neutral-600">
          {t("receipt.loading")}
        </p>
      ) : (
        <div className="receipt-sheet mx-auto w-fit bg-white p-3 shadow-lg">
          <div
            className="receipt text-black"
            style={{
              width: `${width}mm`,
              fontFamily: "var(--font-vazirmatn), var(--font-inter), system-ui, sans-serif",
              fontSize: width === "58" ? "10px" : "11px",
              lineHeight: 1.5,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: width === "58" ? "13px" : "15px", fontWeight: 700 }}>
                {store.name}
              </div>
              {store.address ? (
                <div style={{ marginTop: 2 }}>{store.address}</div>
              ) : null}
              {store.phone ? (
                <div dir="ltr" style={{ marginTop: 2 }}>
                  {t("receipt.phone")}: {store.phone}
                </div>
              ) : null}
            </div>

            <Divider />

            <div style={{ fontWeight: 700, textAlign: "center", fontSize: width === "58" ? "11px" : "12px" }}>
              {t("receipt.invoiceTitle")}
            </div>

            <Row
              label={t("receipt.orderNo")}
              value={<span dir="ltr">#{order.id.slice(0, 8).toUpperCase()}</span>}
            />
            <Row
              label={t("receipt.date")}
              value={new Date(order.created_at).toLocaleString(
                getNumberLocale(locale),
                { dateStyle: "short", timeStyle: "short" },
              )}
            />
            {order.customer?.full_name || order.customer?.phone ? (
              <Row
                label={t("receipt.customer")}
                value={order.customer?.full_name || order.customer?.phone || ""}
              />
            ) : null}
            {order.customer?.phone ? (
              <Row
                label={t("receipt.phone")}
                value={<span dir="ltr">{order.customer.phone}</span>}
              />
            ) : null}
            {order.address?.address_line ? (
              <Row label={t("receipt.address")} value={order.address.address_line} />
            ) : null}
            {order.delivery_slot ? (
              <Row label={t("receipt.deliverySlot")} value={order.delivery_slot} />
            ) : null}
            <Row
              label={t("receipt.payment")}
              value={`${t(`admin.payment.${order.payment_method}`)} · ${
                order.payment_status === "paid"
                  ? t("receipt.paid")
                  : t("receipt.unpaid")
              }`}
            />

            <Divider />

            <div style={{ display: "flex", fontWeight: 700 }}>
              <span style={{ flex: 1 }}>{t("receipt.item")}</span>
              <span>{t("receipt.lineTotal")}</span>
            </div>

            {(order.order_items ?? []).map((item) => {
              const line = Number(item.unit_price) * item.quantity;
              return (
                <div key={item.id} style={{ marginTop: 4 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ flex: 1, wordBreak: "break-word" }}>
                      {item.product
                        ? resolveProductName(item.product, locale)
                        : item.product_id}
                    </span>
                    <Price amount={line} currency={order.currency} />
                  </div>
                  <div dir="ltr" style={{ opacity: 0.7, textAlign: dir === "rtl" ? "right" : "left" }}>
                    {item.quantity.toLocaleString(getNumberLocale(locale))} ×{" "}
                    <Price amount={Number(item.unit_price)} currency={order.currency} />
                  </div>
                </div>
              );
            })}

            <Divider />

            <Row
              label={t("receipt.subtotal")}
              value={<Price amount={totals.subtotal} currency={order.currency} />}
            />
            <Row
              label={t("receipt.deliveryAndVat")}
              value={<Price amount={totals.deliveryAndVat} currency={order.currency} />}
            />
            {totals.cashFee > 0 ? (
              <Row
                label={t("receipt.cashFee")}
                value={<Price amount={totals.cashFee} currency={order.currency} />}
              />
            ) : null}

            <div
              style={{
                display: "flex",
                marginTop: 4,
                paddingTop: 4,
                borderTop: "1px dashed #000",
                fontWeight: 700,
                fontSize: width === "58" ? "12px" : "13px",
              }}
            >
              <span style={{ flex: 1 }}>{t("receipt.total")}</span>
              <Price amount={totals.grand} currency={order.currency} />
            </div>

            <Divider />

            <div style={{ textAlign: "center", marginTop: 2 }}>{store.footer}</div>
            <div style={{ textAlign: "center", opacity: 0.7, marginTop: 4 }}>
              {t("receipt.printedAt")}{" "}
              {new Date().toLocaleString(getNumberLocale(locale), {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />;
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
      <span style={{ flexShrink: 0, opacity: 0.75 }}>{label}:</span>
      <span style={{ flex: 1, wordBreak: "break-word", textAlign: "end" }}>{value}</span>
    </div>
  );
}
