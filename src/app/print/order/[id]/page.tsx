"use client";

import { use } from "react";
import OrderInvoiceClient from "./OrderInvoiceClient";

export default function PrintOrderInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <OrderInvoiceClient orderId={id} />;
}
