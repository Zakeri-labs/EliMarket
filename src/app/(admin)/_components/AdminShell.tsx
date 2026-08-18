"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOutAction } from "@/app/_actions/auth-actions";
import { useAuthStore } from "@/app/_store/auth-store";
import { useUiStore } from "@/app/_store/ui-store";
import { useFormAction } from "@/app/hooks/use-form-action";
import { cn } from "@/app/utils/cn";
import { Button } from "@/components/ui/Button";

const NAV = [
  { href: "/dashboard", label: "داشبورد" },
  { href: "/dashboard/products", label: "محصولات" },
  { href: "/dashboard/orders", label: "سفارش‌ها" },
  { href: "/dashboard/coverage-area", label: "محدوده پوشش" },
];

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleMobile = useUiStore((s) => s.toggleMobile);
  const mobileOpen = useUiStore((s) => s.mobileOpen);
  const clearSession = useAuthStore((s) => s.clearSession);
  const { runAction, isPending } = useFormAction();

  return (
    <div className="flex min-h-full flex-1">
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-40 w-64 border-l border-zinc-200 bg-white p-4 transition-transform md:static md:translate-x-0",
          mobileOpen || sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
        )}
      >
        <p className="mb-6 text-lg font-bold text-emerald-700">پنل ادمین</p>
        <nav className="space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm",
                pathname === item.href
                  ? "bg-emerald-50 font-medium text-emerald-800"
                  : "text-zinc-600 hover:bg-zinc-50",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button
          type="button"
          variant="secondary"
          className="mt-8 w-full"
          disabled={isPending}
          onClick={() =>
            runAction(() => signOutAction(), {
              onSuccess: () => {
                clearSession();
                router.push("/login");
                router.refresh();
              },
            })
          }
        >
          خروج
        </Button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button type="button" className="md:hidden" onClick={toggleMobile}>
              ☰
            </button>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
