"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Phone } from "lucide-react";
import { getOrderByIdAction } from "@/app/_actions/order-actions";
import { OrderStepper } from "@/app/(storefront)/_components/OrderStepper";
import { StorefrontBreadcrumbs } from "@/app/(storefront)/_components/StorefrontBreadcrumbs";
import { createClient } from "@/core/supabase/client";
import type { Order } from "@/app/_types/database.types";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { ProductPlaceholder } from "@/components/icons/ProductPlaceholder";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";

export default function OrderTrackingClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const { t, dir } = useTranslations();
  const formatPrice = useFormatPrice();

  useEffect(() => {
    let mounted = true;

    async function load() {
      const result = await getOrderByIdAction(orderId);
      if (!mounted) return;
      if (result.success && result.data) setOrder(result.data);
      else setError(result.error ?? "Error");
    }

    void load();

    const supabase = createClient();
    const channel = supabase
      .channel(`order-${orderId}-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload: { new: Partial<Order> }) =>
          setOrder((prev) => (prev ? { ...prev, ...payload.new } : prev)),
      )
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (error) {
    return (
      <main className="py-8" dir={dir}>
        <StorefrontBreadcrumbs
          items={[
            { label: t("product.breadcrumbHome"), href: "/" },
            { label: t("orders.title"), href: "/orders" },
          ]}
        />
        <p className="text-danger">{error}</p>
        <Link href="/" className="mt-4 inline-block text-accent-teal">
          {t("orders.tracking.back")}
        </Link>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="py-8 text-text-secondary" dir={dir}>
        <StorefrontBreadcrumbs
          items={[
            { label: t("product.breadcrumbHome"), href: "/" },
            { label: t("orders.title"), href: "/orders" },
          ]}
        />
        {t("orders.tracking.loading")}
      </main>
    );
  }

  const shortId = order.id.slice(0, 8).toUpperCase();
  const orderTitle = t("orders.tracking.orderNumber", { id: shortId });
  const statusMessage =
    order.status === "out_for_delivery"
      ? t("orders.tracking.onTheWay")
      : t(`orders.tracking.${order.status}`);
  const showRiderArt = order.status === "out_for_delivery";
  const showContactRider = order.status === "out_for_delivery";

  const crumbs = [
    { label: t("product.breadcrumbHome"), href: "/" },
    { label: t("orders.title"), href: "/orders" },
    { label: orderTitle },
  ];

  return (
    <main className="w-full py-4 pb-8 md:py-8" dir={dir}>
      <StorefrontBreadcrumbs items={crumbs} />

      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3 md:mb-8">
        <h1 className="min-w-0 truncate text-lg font-bold text-text-primary md:text-2xl">
          {orderTitle}
        </h1>
        <button type="button" className="shrink-0 text-sm font-medium text-accent-teal md:text-[15px]">
          {t("orders.tracking.help")}
        </button>
      </div>

      <div className="space-y-4 md:grid md:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] md:items-start md:gap-10 md:space-y-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,480px)] lg:gap-14">
        {/* Status card */}
        <section className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-card md:rounded-3xl">
          <div className="px-4 pt-4 text-center md:px-8 md:pt-8">
            <p className="text-xs text-text-secondary md:text-sm">
              {t("orders.tracking.estimatedDelivery", {
                slot: order.delivery_slot ?? "—",
              })}
            </p>
            <p className="mt-1 text-base font-semibold text-text-primary md:mt-2 md:text-xl">
              {statusMessage}
            </p>
          </div>

          {showRiderArt ? (
            <div className="relative mx-auto my-4 flex h-36 w-full max-w-[280px] items-center justify-center px-4 md:my-8 md:h-48 md:max-w-[360px]">
              <Image
                src="/motorbike.png"
                alt=""
                width={420}
                height={280}
                priority
                className={cn(
                  "h-auto max-h-36 w-full object-contain drop-shadow-[0_12px_28px_rgba(45,212,191,0.25)] md:max-h-48",
                  dir === "rtl" && "-scale-x-100",
                )}
              />
            </div>
          ) : (
            <div className="h-4 md:h-8" aria-hidden />
          )}

          <div className="border-t border-border-subtle px-3 py-4 md:px-8 md:py-6">
            <OrderStepper status={order.status} />
          </div>
        </section>

        {/* Order details */}
        <div className="space-y-4 md:sticky md:top-24">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-2xl border border-border-subtle bg-bg-card px-4 py-3.5 text-sm font-medium text-text-primary md:pointer-events-none md:cursor-default md:px-5 md:py-4 md:text-base"
            onClick={() => setDetailsOpen((v) => !v)}
            aria-expanded={detailsOpen}
          >
            <span>{t("orders.tracking.orderDetails")}</span>
            <AppIcon
              icon={ChevronDown}
              size="sm"
              className={cn(
                "text-text-secondary transition-transform md:hidden",
                !detailsOpen && "-rotate-90",
              )}
            />
          </button>

          <ul className={cn("space-y-2 md:space-y-3", !detailsOpen && "max-md:hidden")}>
              {order.order_items?.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-bg-card px-3 py-2.5 md:gap-4 md:px-4 md:py-3.5"
                >
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-bg-main md:h-14 md:w-14">
                    {item.product?.image_url ? (
                      <StorefrontImage
                        src={item.product.image_url}
                        blurHash={item.product.blur_hash}
                        alt=""
                        fill
                        sizes="56px"
                        withBlur={false}
                        className="object-contain p-1"
                      />
                    ) : (
                      <ProductPlaceholder size="sm" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1 text-start">
                    <p className="truncate text-sm font-medium text-text-primary md:text-[15px]">
                      {item.product?.name ?? t("product.fallbackName")}
                    </p>
                    <p className="mt-0.5 text-xs text-text-secondary md:text-sm">
                      ×{item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-text-primary tabular-nums md:text-[15px]">
                    {formatPrice(Number(item.unit_price) * item.quantity)}
                  </p>
                </li>
              ))}
              <li className="flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-card px-4 py-3.5 text-sm md:px-5 md:py-4 md:text-base">
                <span className="text-text-secondary">{t("checkout.total")}</span>
                <span className="font-bold text-accent-teal tabular-nums">
                  {formatPrice(Number(order.total), order.currency)}
                </span>
              </li>
            </ul>

          {showContactRider ? (
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-accent-gold/70 bg-transparent px-4 py-3.5 text-sm font-semibold text-accent-gold md:py-4 md:text-[15px]"
            >
              <AppIcon icon={Phone} size="sm" />
              {t("orders.tracking.contactRider")}
            </button>
          ) : null}
        </div>
      </div>
    </main>
  );
}
