"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCategories } from "@/app/(storefront)/_hooks/use-categories";
import { cn } from "@/app/utils/cn";
import { useTranslations } from "@/i18n/use-translations";
import { topLevelCategories } from "@/lib/categories/tree";
import { resolveCategoryName } from "@/lib/i18n/category-name";

const NAV_SLUGS = [
  "produce",
  "dairy",
  "meat",
  "bakery",
  "beverages",
  "snacks",
  "pantry",
  "personal-care",
] as const;

export function CategoryNav() {
  const pathname = usePathname();
  const { t, locale } = useTranslations();
  const { data: categories } = useCategories();

  const catalog = topLevelCategories(categories ?? []);
  const items = NAV_SLUGS.map((slug) => catalog.find((cat) => cat.slug === slug)).filter(
    (cat): cat is NonNullable<typeof cat> => Boolean(cat),
  );
  const allActive = pathname === "/categories" || pathname === "/";

  return (
    <div className="h-[52px] border-b border-border-subtle bg-bg-main">
      <div className="flex h-full w-full items-center justify-between px-8">
        <nav className="flex items-center gap-7" aria-label={t("nav.categories")}>
          <Link
            href="/categories"
            className={cn(
              "text-sm",
              allActive
                ? "font-bold text-accent-teal"
                : "text-text-primary hover:text-accent-teal",
            )}
          >
            {t("home.allCategories")}
          </Link>
          {items.map((cat) => {
            const href = `/categories/${cat.slug}`;
            const active = pathname === href;
            return (
              <Link
                key={cat.id}
                href={href}
                className={cn(
                  "text-sm whitespace-nowrap text-text-primary hover:text-accent-teal",
                  active && "font-bold text-accent-teal",
                )}
              >
                {resolveCategoryName(cat, locale)}
              </Link>
            );
          })}
        </nav>
        <Link href="/offers" className="ms-auto text-sm text-accent-gold">
          {t("home.flashDeals")}
        </Link>
      </div>
    </div>
  );
}
