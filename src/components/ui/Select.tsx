"use client";

import {
  Children,
  Fragment,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";

const SEARCH_THRESHOLD = 7;

function optionText(label: ReactNode): string {
  return typeof label === "string" || typeof label === "number" ? String(label) : "";
}

type OptionItem = { value: string; label: ReactNode; disabled: boolean };

type OptionProps = {
  value?: string | number;
  disabled?: boolean;
  children?: ReactNode;
};

/** Flattens `<option>` children (including fragments and mapped arrays). */
function collectOptions(children: ReactNode, out: OptionItem[] = []): OptionItem[] {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === Fragment) {
      collectOptions((child as ReactElement<{ children?: ReactNode }>).props.children, out);
      return;
    }
    if (child.type === "option") {
      const props = child.props as OptionProps;
      const label = props.children;
      out.push({
        value: String(props.value ?? (typeof label === "string" ? label : "")),
        label,
        disabled: Boolean(props.disabled),
      });
    }
  });
  return out;
}

type Props = {
  value: string | number;
  /** Receives a change-event-like object, so `e.target.value` works as with a native select. */
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  placeholder?: string;
  "aria-label"?: string;
};

/**
 * Themed replacement for the native `<select>`. Same API: `value`, `onChange(e)` and
 * `<option>` children. The list is portalled so modals and scrolling tables never clip it.
 */
export function Select({
  value,
  onChange,
  children,
  className,
  disabled,
  id,
  name,
  placeholder,
  "aria-label": ariaLabel,
}: Props) {
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState("");
  const [scoped, setScoped] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [pos, setPos] = useState<{
    left: number;
    width: number;
    top?: number;
    bottom?: number;
    maxHeight: number;
  } | null>(null);

  const allOptions = useMemo(() => collectOptions(children), [children]);
  const current = String(value ?? "");
  const searchable = allOptions.length > SEARCH_THRESHOLD;
  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allOptions;
    return allOptions.filter((o) => optionText(o.label).toLowerCase().includes(q));
  }, [allOptions, query]);
  const selectedIndex = options.findIndex((o) => o.value === current);
  const selected = allOptions.find((o) => o.value === current);

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 6;
    const below = window.innerHeight - rect.bottom - gap - 8;
    const above = rect.top - gap - 8;
    const flip = below < 180 && above > below;
    setPos({
      left: rect.left,
      width: rect.width,
      maxHeight: Math.max(120, Math.min(280, flip ? above : below)),
      ...(flip
        ? { bottom: window.innerHeight - rect.top + gap }
        : { top: rect.bottom + gap }),
    });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || popRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onScroll = (e: Event) => {
      if (popRef.current?.contains(e.target as Node)) return;
      place();
    };
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, place]);

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openList = () => {
    if (disabled) return;
    setQuery("");
    setScoped(Boolean(triggerRef.current?.closest(".theme-admin")));
    setActive(selectedIndex >= 0 ? selectedIndex : Math.max(0, options.findIndex((o) => !o.disabled)));
    setOpen(true);
  };

  const choose = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    setOpen(false);
    triggerRef.current?.focus();
    if (option.value === current) return;
    const target = { value: option.value, name: name ?? "" };
    onChange?.({ target, currentTarget: target } as unknown as ChangeEvent<HTMLSelectElement>);
  };

  const move = (step: 1 | -1) => {
    if (!options.length) return;
    let next = active;
    for (let i = 0; i < options.length; i += 1) {
      next = (next + step + options.length) % options.length;
      if (!options[next].disabled) break;
    }
    setActive(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) openList();
      else move(e.key === "ArrowDown" ? 1 : -1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open) choose(active);
      else openList();
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  const label = selected?.label ?? placeholder ?? "";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={cn(
          "inline-flex min-h-10 w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-start text-sm text-foreground outline-none transition-[border-color,box-shadow]",
          "hover:border-zinc-300 focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/10",
          open && "border-accent ring-4 ring-accent/10",
          "disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-60",
          className,
        )}
      >
        <span className={cn("min-w-0 flex-1 truncate", !selected && "text-muted")}>{label}</span>
        <AppIcon
          icon={ChevronDown}
          size="sm"
          className={cn("shrink-0 text-muted transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      {name ? <input type="hidden" name={name} value={current} /> : null}
      {open && pos
        ? createPortal(
            <div
              ref={popRef}
              style={{
                position: "fixed",
                left: pos.left,
                width: pos.width,
                top: pos.top,
                bottom: pos.bottom,
                maxHeight: pos.maxHeight,
              }}
              className={cn(
                "select-pop z-[100100] flex flex-col overflow-hidden rounded-xl border border-border bg-surface text-sm text-foreground shadow-[0_12px_40px_-8px_rgba(24,24,27,0.18),0_2px_6px_rgba(24,24,27,0.06)]",
                scoped && "theme-admin",
              )}
            >
              {searchable ? (
                <div className="flex shrink-0 items-center gap-2 border-b border-zinc-100 px-3 py-2">
                  <AppIcon icon={Search} size="xs" className="shrink-0 text-muted" />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setActive(0);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                        e.preventDefault();
                        move(e.key === "ArrowDown" ? 1 : -1);
                      } else if (e.key === "Enter") {
                        e.preventDefault();
                        choose(active);
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        setOpen(false);
                        triggerRef.current?.focus();
                      }
                    }}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
                    placeholder="…"
                    aria-label="search"
                  />
                </div>
              ) : null}
              <ul
                ref={listRef}
                id={listId}
                role="listbox"
                className="admin-thin-scroll min-h-0 flex-1 overflow-y-auto p-1"
              >
                {options.length === 0 ? (
                  <li className="px-3 py-3 text-center text-xs text-muted">—</li>
                ) : null}
                {options.map((option, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <li
                      key={`${option.value}-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled}
                      data-index={index}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => choose(index)}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 transition-colors",
                        index === active && "bg-accent/10",
                        isSelected && "font-medium text-accent-dark",
                        option.disabled && "cursor-not-allowed opacity-40",
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate">{option.label}</span>
                      {isSelected ? <AppIcon icon={Check} size="xs" className="shrink-0" /> : null}
                    </li>
                  );
                })}
              </ul>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
