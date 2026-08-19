import Link from "next/link";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { PriceVisibilityToggle } from "@/app/(admin)/_components/PriceVisibilityToggle";

export default function AdminDashboardPage() {
  return (
    <AdminShell title="داشبورد">
      <div className="mb-8 rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
        <PriceVisibilityToggle />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/dashboard/products", label: "مدیریت محصولات", desc: "افزودن، تصویر، موجودی" },
          { href: "/dashboard/orders", label: "مدیریت سفارش‌ها", desc: "وضعیت و پیک" },
          { href: "/dashboard/reports", label: "گزارشات مالی", desc: "درآمد و موجودی کم" },
          { href: "/dashboard/coverage-area", label: "محدوده پوشش", desc: "نقشه تحویل" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-[#e4e4e7] bg-white p-6 shadow-sm transition-colors hover:border-[#6b8f71]"
          >
            <p className="font-semibold text-[#527559]">{item.label}</p>
            <p className="mt-1 text-sm text-[#71717a]">{item.desc}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
