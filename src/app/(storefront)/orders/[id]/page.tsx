"use client";

import { use } from "react";
import OrderTrackingClient from "@/app/(storefront)/orders/[id]/OrderTrackingClient";

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <OrderTrackingClient orderId={id} />;
}
