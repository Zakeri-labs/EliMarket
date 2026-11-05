"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { BRAND_NAME } from "@/config/brand";
import { Modal } from "@/components/ui/Modal";
import { useCardReveal, useOmanClock, useSidebarIntro, useTitleCardIntro } from "@/app/(admin)/_components/useAdminMotion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  Sparkles,
  FolderTree,
  Tag,
  Image as ImageIcon,
  Newspaper,
  Percent,
  ClipboardList,
  MapPinned,
  BarChart3,
  Users,
  Star,
  MessageCircleQuestion,
  Bike,
  Settings,
  Clock,
  ChevronLeft,
  LogOut,
  Search,
  type LucideIcon,
} from "lucide-react";
import { signOutAction } from "@/app/_actions/auth-actions";
import { useAuthStore } from "@/app/_store/auth-store";
import { useUiStore } from "@/app/_store/ui-store";
import { useFormAction } from "@/app/hooks/use-form-action";
import { cn } from "@/app/utils/cn";
import { AdminNotificationBell } from "@/app/(admin)/_components/AdminNotificationBell";
import { AppIcon } from "@/components/icons/AppIcon";
import { LanguageTabs } from "@/components/i18n/LanguageTabs";
import { useTranslations } from "@/i18n/use-translations";

type NavItem = { href: string; key: string; icon: LucideIcon };
type NavGroup = { groupKey: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    groupKey: "admin.navGroups.overview",
    items: [{ href: "/dashboard", key: "admin.nav.dashboard", icon: LayoutDashboard }],
  },
  {
    groupKey: "admin.navGroups.catalog",
    items: [
      { href: "/dashboard/products", key: "admin.nav.products", icon: Package },
      { href: "/dashboard/products/smart", key: "admin.nav.smartProduct", icon: Sparkles },
      { href: "/dashboard/categories", key: "admin.nav.categories", icon: FolderTree },
      { href: "/dashboard/brands", key: "admin.nav.brands", icon: Tag },
      { href: "/dashboard/reviews", key: "admin.nav.reviews", icon: Star },
      { href: "/dashboard/questions", key: "admin.nav.questions", icon: MessageCircleQuestion },
    ],
  },
  {
    groupKey: "admin.navGroups.marketing",
    items: [
      { href: "/dashboard/banners", key: "admin.nav.banners", icon: ImageIcon },
      { href: "/dashboard/campaigns", key: "admin.nav.campaigns", icon: Percent },
      { href: "/dashboard/blog", key: "admin.nav.blog", icon: Newspaper },
    ],
  },
  {
    groupKey: "admin.navGroups.operations",
    items: [
      { href: "/dashboard/orders", key: "admin.nav.orders", icon: ClipboardList },
      { href: "/dashboard/riders", key: "admin.nav.riders", icon: Bike },
      { href: "/dashboard/delivery-areas", key: "admin.nav.deliveryAreas", icon: MapPinned },
      // Hidden for now: { href: "/dashboard/coverage-area", key: "admin.nav.coverage", icon: MapPin },
    ],
  },
  {
    groupKey: "admin.navGroups.insights",
    items: [
      { href: "/dashboard/reports", key: "admin.nav.reports", icon: BarChart3 },
      { href: "/dashboard/customers", key: "admin.nav.customers", icon: Users },
    ],
  },
  {
    groupKey: "admin.navGroups.system",
    items: [{ href: "/dashboard/settings", key: "admin.nav.settings", icon: Settings }],
  },
];

function QuickFind() {
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const pages = NAV_GROUPS.flatMap((group) => group.items).filter(
    (item) => !q || t(item.key).toLowerCase().includes(q),
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-11 min-w-0 max-w-sm flex-1 items-center gap-2 rounded-xl border border-border px-4 text-sm text-muted transition hover:border-accent/40 hover:text-foreground sm:flex"
      >
        <AppIcon icon={Search} size="sm" className="shrink-0" />
        <span className="truncate">{t("adminUi.searchPages")}</span>
      </button>
      <Modal
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
        title={t("adminUi.searchPages")}
        size="sm"
      >
        <input
          autoFocus
          aria-label={t("adminUi.searchPages")}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("adminUi.searchPages")}
          className="mb-3 w-full bg-card px-3"
        />
        {pages.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">{t("adminUi.noPages")}</p>
        ) : (
          <ul className="space-y-1">
            {pages.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors hover:bg-accent/10 hover:text-accent-dark"
                >
                  <AppIcon icon={item.icon} size="sm" />
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </>
  );
}

export function AdminShell({
  title,
  subtitle,
  eyebrow,
  actions,
  intro = true,
  children,
}: {
  title: ReactNode;
  subtitle?: string;
  /** Replaces the breadcrumb above the title. */
  eyebrow?: ReactNode;
  /** Page-level buttons, shown at the end of the title card. */
  actions?: ReactNode;
  /** Off for the loading fallback, so the real page plays the entrance once. */
  intro?: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const toggleMobile = useUiStore((s) => s.toggleMobile);
  const mobileOpen = useUiStore((s) => s.mobileOpen);
  const setMobileOpen = useUiStore((s) => s.setMobileOpen);
  const clearSession = useAuthStore((s) => s.clearSession);
  const session = useAuthStore((s) => s.session);
  const { runAction, isPending } = useFormAction();
  const { t, locale } = useTranslations();
  const pageRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Focus follows the phone menu in and back out.
  useEffect(() => {
    if (mobileOpen) requestAnimationFrame(() => closeButtonRef.current?.focus());
    else if (wasOpen.current) menuButtonRef.current?.focus();
    wasOpen.current = mobileOpen;
  }, [mobileOpen]);
  const navRef = useSidebarIntro();
  const titleCardRef = useTitleCardIntro(intro);
  useCardReveal(pageRef);
  const omanClock = useOmanClock(locale);
  const activeGroup = NAV_GROUPS.find((group) => group.items.some((item) => item.href === pathname));
  const activeItem = activeGroup?.items.find((item) => item.href === pathname);
  const userName = session?.fullName || t("admin.panelLabel");
  const initial = (session?.fullName || session?.email || "A").trim().charAt(0).toUpperCase();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, setMobileOpen]);

  // The backdrop and close button only exist below this width, so leaving it must close the menu.
  useEffect(() => {
    if (!mobileOpen) return;
    const wide = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    wide.addEventListener("change", onChange);
    return () => wide.removeEventListener("change", onChange);
  }, [mobileOpen, setMobileOpen]);

  // The shell remounts per page; keep the current item in view in a long menu.
  useLayoutEffect(() => {
    const nav = navRef.current;
    const item = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (nav && item) nav.scrollTop = item.offsetTop - nav.clientHeight / 2;
  }, [pathname, navRef]);

  const closeMobile = () => setMobileOpen(false);
  const signOut = () =>
    runAction(() => signOutAction(), {
      onSuccess: () => {
        clearSession();
        router.push("/login");
        router.refresh();
      },
    });

  return (
    <div className="flex h-full min-h-0 w-full flex-1 gap-4 overflow-hidden p-0 lg:p-4">
      {mobileOpen && (
        <button
          type="button"
          aria-label={t("admin.closeMenu")}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={closeMobile}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 flex w-[264px] shrink-0 flex-col overflow-hidden bg-[var(--sidebar)] text-[var(--sidebar-foreground)] shadow-[var(--card-shadow)] transition-[translate,visibility] motion-reduce:transition-none lg:static lg:h-full lg:translate-x-0 lg:rounded-[var(--card-radius)]",
          mobileOpen
            ? "visible translate-x-0"
            : "max-lg:invisible max-lg:-translate-x-full max-lg:rtl:translate-x-full",
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 px-4 pt-5 pb-3">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-hills.png"
              alt=""
              className="size-11 shrink-0 rounded-full bg-white object-contain p-0.5"
            />
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-logo text-lg font-semibold text-[var(--sidebar-strong)]">
                {BRAND_NAME}
              </span>
              <span className="block truncate text-xs text-[var(--sidebar-muted)]">
                {t("admin.panelLabel")}
              </span>
            </span>
          </Link>
          <button
            type="button"
            className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-[var(--sidebar-accent)] lg:hidden"
            ref={closeButtonRef}
            onClick={closeMobile}
            aria-label={t("admin.closeMenu")}
          >
            <AppIcon icon={X} size="md" />
          </button>
        </div>
        <nav
          ref={navRef}
          className="admin-thin-scroll relative min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-2"
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.groupKey} className="space-y-0.5">
              <p className="px-3.5 pb-1 text-xs font-bold text-[var(--sidebar-muted)]">
                {t(group.groupKey)}
              </p>
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobile}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex min-h-11 items-center gap-2.5 rounded-xl px-3.5 text-sm font-medium transition-[background-color,color] duration-200 lg:min-h-9",
                      active
                        ? "bg-accent text-white"
                        : "hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-strong)]",
                    )}
                  >
                    <AppIcon
                      icon={item.icon}
                      size="sm"
                      className="transition-transform duration-200 group-hover:scale-125 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                    {t(item.key)}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="shrink-0 p-4">
          <div className="flex items-center gap-2.5 rounded-2xl bg-[var(--sidebar-accent)] px-3 py-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-white">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--sidebar-strong)]">{userName}</p>
              {session?.email ? (
                <p className="truncate text-xs text-[var(--sidebar-muted)]" dir="ltr">
                  {session.email}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={signOut}
              title={t("admin.signOut")}
              aria-label={t("admin.signOut")}
              className="grid size-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 lg:size-8"
            >
              <AppIcon icon={LogOut} size="sm" className="rtl:-scale-x-100" />
            </button>
          </div>
        </div>
      </aside>

      {/* While the phone menu is open, Tab must stay inside it. */}
      <div inert={mobileOpen} className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 p-3 lg:p-0">
        <header className="admin-card flex h-[70px] shrink-0 items-center gap-1.5 px-3 md:px-4">
          <button
            type="button"
            className="grid size-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-accent/10 hover:text-accent-dark lg:hidden"
            ref={menuButtonRef}
            onClick={toggleMobile}
            aria-label={t("admin.menu")}
            aria-expanded={mobileOpen}
          >
            <AppIcon icon={Menu} size="md" />
          </button>
          <QuickFind />
          <div className="ms-auto flex shrink-0 items-center gap-2">
            <Link
              href="/dashboard/products/smart"
              className="hidden h-10 items-center bg-accent hover:bg-accent-dark transition-colors gap-1.5 whitespace-nowrap rounded-xl px-4 text-sm font-semibold text-white shadow-[0_6px_16px_-6px_rgba(13,138,127,0.8)] lg:flex"
            >
              <AppIcon icon={Sparkles} size="sm" />
              {t("admin.nav.smartProduct")}
            </Link>
            <p
              className="hidden items-center gap-1.5 px-2 text-sm whitespace-nowrap text-muted xl:flex"
              title={t("adminUi.omanTime")}
            >
              <AppIcon icon={Clock} size="sm" className="text-accent" />
              <span dir="auto">{omanClock}</span>
            </p>
            <LanguageTabs
              compact
              className="border-border bg-background [&_button[aria-selected=true]]:bg-accent [&_button[aria-selected=true]]:text-white"
            />
            <AdminNotificationBell />
            <span className="hidden min-w-0 items-center gap-2 ps-1 md:flex">
              <span className="hidden max-w-32 truncate text-sm font-medium 2xl:block">{userName}</span>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent/10 text-sm font-bold text-accent-dark">
                {initial}
              </span>
            </span>
          </div>
        </header>
        <div
          ref={pageRef}
          className="admin-page-scroll admin-thin-scroll lg:-mx-1"
          style={{
            flex: "1 1 0%",
            minHeight: 0,
            height: 0,
            overflowX: "hidden",
            overflowY: "auto",
            overscrollBehavior: "contain",
          }}
        >
          <div className="admin-page-enter mx-auto w-full max-w-[1500px] px-1 pb-6">
            <div
              ref={titleCardRef}
              data-no-reveal
              className="admin-card relative mb-4 overflow-hidden px-4 py-3.5 md:px-5"
            >
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  {activeItem ? (
                    <span
                      data-title-tile
                      className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-white"
                    >
                      <AppIcon icon={activeItem.icon} size="sm" />
                    </span>
                  ) : null}
                  <div data-title-text className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      {eyebrow ??
                        (activeGroup ? (
                          <>
                            <span>{t(activeGroup.groupKey)}</span>
                            <AppIcon icon={ChevronLeft} size="xs" className="ltr:rotate-180" />
                            <span>{activeItem ? t(activeItem.key) : null}</span>
                          </>
                        ) : null)}
                    </div>
                    <h1 className="text-xl leading-tight font-bold text-foreground md:text-2xl">
                      {title}
                    </h1>
                    {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
                  </div>
                </div>
                {actions ? (
                  <div data-title-actions className="flex flex-wrap items-center gap-2">
                    {actions}
                  </div>
                ) : null}
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
