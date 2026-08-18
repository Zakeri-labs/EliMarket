import Link from "next/link";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";

export default function AdminDashboardPage() {
  return (
    <AdminShell title="داشبورد">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { href: "/dashboard/products", label: "مدیریت محصولات" },
          { href: "/dashboard/orders", label: "مدیریت سفارش‌ها" },
          { href: "/dashboard/coverage-area", label: "محدوده پوشش" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm hover:border-emerald-300"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
