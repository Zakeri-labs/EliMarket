"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  AlertTriangle,
  BarChart3,
  Bike,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  Clock,
  EyeOff,
  FileText,
  FolderTree,
  Image as ImageIcon,
  MapPinned,
  MessageCircleQuestion,
  Package,
  PackageX,
  Percent,
  ShoppingBag,
  Star,
  Tag,
  Truck,
  UserPlus,
  Users,
  Wallet,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { useLocaleStore } from "@/app/_store/locale-store";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { getNumberLocale } from "@/i18n/config";

gsap.registerPlugin(useGSAP);

const ICONS = {
  alert: AlertTriangle,
  bag: ShoppingBag,
  banner: ImageIcon,
  bike: Bike,
  box: Package,
  boxOff: PackageX,
  calendar: CalendarClock,
  chart: BarChart3,
  check: CheckCircle2,
  clock: Clock,
  dashed: CircleDashed,
  file: FileText,
  folder: FolderTree,
  hidden: EyeOff,
  map: MapPinned,
  percent: Percent,
  question: MessageCircleQuestion,
  star: Star,
  tag: Tag,
  truck: Truck,
  userPlus: UserPlus,
  users: Users,
  wallet: Wallet,
  x: XCircle,
} satisfies Record<string, LucideIcon>;

export type KpiTone = "teal" | "amber" | "rose" | "sky" | "slate";

const TONES: Record<KpiTone, string> = {
  teal: "15 118 110",
  amber: "180 83 9",
  rose: "214 31 37",
  sky: "35 112 199",
  slate: "91 107 134",
};

export type KpiItem = {
  label: string;
  /** A number counts up; `undefined` shows a loading block. */
  value: number | ReactNode;
  sub?: ReactNode;
  icon: keyof typeof ICONS;
  tone?: KpiTone;
  decimals?: number;
};

function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const locale = useLocaleStore((s) => s.locale);
  const ref = useRef<HTMLSpanElement>(null);
  // A saved row refetches the numbers; they move from where they were rather than from zero.
  const shown = useRef(0);
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(getNumberLocale(locale), {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [locale, decimals],
  );
  const format = (n: number) => formatter.format(n);

  useGSAP(
    () => {
      const node = ref.current;
      if (!node) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const state = { n: shown.current };
        gsap.to(state, {
          n: value,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            // The text node, not textContent: replacing it would wake the reveal observer every frame.
            if (node.firstChild) node.firstChild.nodeValue = format(state.n);
            shown.current = state.n;
          },
        });
      });
      return () => mm.revert();
    },
    { dependencies: [value, locale], revertOnUpdate: true },
  );

  return (
    <span ref={ref} className="tabular-nums">
      {format(value)}
    </span>
  );
}

export function KpiCard({ item }: { item: KpiItem }) {
  const rgb = TONES[item.tone ?? "teal"];
  const reduceMotion = useReducedMotion();
  return (
    <div data-reveal className="min-w-0">
      <motion.div
        data-no-reveal
        whileHover={reduceMotion ? undefined : { y: -6 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{
          backgroundImage: `linear-gradient(135deg, rgb(${rgb} / .1), rgb(${rgb} / .03) 70%)`,
        }}
        className="admin-card group relative h-full min-w-0 overflow-hidden p-3.5 transition-shadow duration-300 hover:shadow-[var(--card-shadow-hover)] md:p-4"
      >
        <svg
          data-kpi-corner
          viewBox="0 0 60 82"
          aria-hidden
          className="pointer-events-none absolute end-0 top-0 h-[62px] w-[45px] opacity-60 transition-opacity duration-500 group-hover:opacity-100 rtl:-scale-x-100"
        >
          <path
            d="M60 0H8c-6 0-9 6-6 11 5 9 13 12 13 24 0 14-10 18-10 30 0 10 9 17 22 17h33Z"
            fill={`rgb(${rgb})`}
            opacity=".16"
          />
          <path
            d="M60 0H22c-5 0-7 5-5 9 4 8 10 11 10 21 0 12-8 16-8 26 0 8 7 14 18 14h23Z"
            fill={`rgb(${rgb})`}
            opacity=".22"
          />
        </svg>
        <span
          data-kpi-icon
          style={{
            background: `rgb(${rgb})`,
            boxShadow: `0 6px 14px -6px rgb(${rgb} / .7)`,
          }}
          className="relative grid size-9 place-items-center rounded-full text-white"
        >
          <AppIcon
            icon={ICONS[item.icon]}
            size="sm"
            className="transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0"
          />
        </span>
        <p className="relative mt-2.5 line-clamp-2 text-xs font-medium text-muted" title={item.label}>
          {item.label}
        </p>
        <div className="relative mt-0.5 min-h-7 text-lg leading-tight md:text-[22px] font-bold text-foreground [overflow-wrap:break-word]">
          {item.value === undefined ? (
            <span className="block h-7 w-20 animate-pulse rounded-lg bg-[var(--skeleton)]" aria-hidden />
          ) : typeof item.value === "number" ? (
            <CountUp value={item.value} decimals={item.decimals} />
          ) : (
            item.value
          )}
        </div>
        {item.sub ? <p className="relative mt-1 line-clamp-2 text-xs text-muted">{item.sub}</p> : null}
      </motion.div>
    </div>
  );
}

const COLUMNS: Record<number, string> = {
  2: "grid-cols-2",
  3: "lg:grid-cols-3",
};

export function KpiRow({
  items,
  columns,
  spacing = "mb-4",
  hidden = false,
}: {
  items: KpiItem[];
  columns?: string;
  spacing?: string;
  /** Without data the cards would pulse forever next to the load error. */
  hidden?: boolean;
}) {
  if (hidden) return null;
  return (
    <MotionConfig reducedMotion="user">
      <div className={cn(
          "grid grid-cols-2 gap-3 max-lg:[&>*:last-child:nth-child(odd)]:col-span-2",
          columns ?? COLUMNS[items.length] ?? "lg:grid-cols-4",
          spacing,
        )}>
        {items.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>
    </MotionConfig>
  );
}

/** The slim stat row under the main cards. */
export function MiniStats({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="admin-card flex min-w-0 items-center gap-3 px-4 py-3.5 max-sm:flex-col max-sm:items-start transition-shadow duration-300 hover:shadow-[var(--card-shadow-hover)]"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent/10 text-accent-dark">
            <AppIcon icon={ICONS[item.icon]} size="sm" />
          </span>
          <span className="min-w-0">
            <span className="block text-lg leading-tight font-bold">
              {typeof item.value === "number" ? <CountUp value={item.value} /> : item.value}
            </span>
            <span className="line-clamp-2 block text-xs text-muted" title={item.label}>
              {item.label}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

const AVATAR_TONES = ["bg-teal-100 text-teal-900", "bg-sky-100 text-sky-900", "bg-amber-100 text-amber-900", "bg-rose-100 text-rose-900", "bg-slate-200 text-slate-800"];

/** Initials circle plus a name, used for people in tables. */
export function PersonCell({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  const tone = AVATAR_TONES[[...name].reduce((sum, ch) => sum + (ch.codePointAt(0) ?? 0), 0) % AVATAR_TONES.length];
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold", tone)}>
        {initials}
      </span>
      <span className="min-w-0 font-medium [overflow-wrap:anywhere]">{name}</span>
    </span>
  );
}
