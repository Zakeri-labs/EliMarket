"use client";

import { useLayoutEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import gsap from "gsap";
import { OMAN_TIME_ZONE } from "@/config/oman-time";

const REVEAL_SELECTOR = ".admin-card, tbody tr, [data-reveal]";

function shouldReveal(el: Element, root: Element) {
  if (el.closest("[data-no-reveal], .skeleton, [aria-busy='true'], [aria-busy='']")) return false;
  // A table reveals row by row, so its wrapper card must not animate too.
  if (el.matches(".admin-card") && el.querySelector("table")) return false;
  if (el.matches("tbody tr") && el.querySelector("td[colspan]")) return false;
  const parentCard = el.parentElement?.closest(".admin-card");
  if (parentCard && root.contains(parentCard) && !el.matches("tbody tr")) return false;
  return true;
}

/**
 * Staggered scroll reveal for every card and table row, including ones that arrive
 * after data loads. Opacity only hides them from view, so keyboard focus still works.
 */
export function useCardReveal(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const seen = new WeakSet<Element>();
      const pending = new Set<Element>();
      let safety: number | null = null;
      const intersection = new IntersectionObserver(
        (entries) => {
          const entering = entries.filter((entry) => entry.isIntersecting).map((e) => e.target);
          if (entering.length === 0) return;
          entering.forEach((el) => {
            intersection.unobserve(el);
            pending.delete(el);
          });
          gsap.to(entering, {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.07,
            clearProps: "opacity,transform",
          });
          entering.forEach((el, index) => {
            const delay = index * 0.07 + 0.15;
            const icon = el.querySelector("[data-kpi-icon]");
            if (icon) {
              gsap.from(icon, {
                scale: 0,
                rotation: -90,
                duration: 0.7,
                delay,
                ease: "back.out(2)",
                clearProps: "transform",
              });
            }
            const corner = el.querySelector("[data-kpi-corner]");
            if (corner) {
              gsap.from(corner, {
                y: -90,
                duration: 0.8,
                delay,
                ease: "power3.out",
                clearProps: "transform",
              });
            }
          });
        },
        { root, rootMargin: "0px 0px -24px 0px" },
      );

      const showStuckCards = () => {
        const bounds = root.getBoundingClientRect();
        pending.forEach((el) => {
          if (!el.isConnected) {
            intersection.unobserve(el);
            pending.delete(el);
            return;
          }
          const rect = el.getBoundingClientRect();
          if (rect.top >= bounds.bottom || rect.bottom <= bounds.top) return;
          intersection.unobserve(el);
          pending.delete(el);
          gsap.set(el, { clearProps: "opacity,transform" });
        });
      };

      const rowStart = getComputedStyle(root).direction === "rtl" ? 40 : -40;
      const scan = () => {
        root.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
          if (seen.has(el) || !shouldReveal(el, root)) return;
          seen.add(el);
          if (el.matches("tr")) {
            gsap.set(el, { opacity: 0, x: rowStart });
          } else {
            gsap.set(el, { opacity: 0, y: 32, scale: 0.97 });
          }
          pending.add(el);
          intersection.observe(el);
        });
        // Content must never stay hidden if animation frames are paused or slow.
        if (safety === null) {
          safety = window.setTimeout(() => {
            safety = null;
            showStuckCards();
          }, 1500);
        }
      };

      // Runs before paint, so new cards are hidden before they can flash.
      const mutation = new MutationObserver(scan);
      scan();
      mutation.observe(root, { childList: true, subtree: true });

      return () => {
        if (safety !== null) window.clearTimeout(safety);
        mutation.disconnect();
        intersection.disconnect();
        pending.forEach((el) => gsap.set(el, { clearProps: "opacity,transform" }));
        pending.clear();
      };
    });

    return () => mm.revert();
  }, [rootRef]);
}

/** Multi-step entrance for the title card: card, tile pop, then the text. */
export function useTitleCardIntro() {
  const cardRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const direction = getComputedStyle(card).direction === "rtl" ? 1 : -1;
      const timeline = gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(card, { opacity: 0, y: 24, duration: 0.5, clearProps: "opacity,transform" });
      // Pages without actions or a tile must skip that step: GSAP warns on empty targets.
      const step = (selector: string, vars: gsap.TweenVars, position: string) => {
        const targets = card.querySelectorAll(selector);
        if (targets.length > 0) timeline.from(targets, vars, position);
      };
      step(
        "[data-title-tile]",
        { scale: 0, rotation: -120, duration: 0.7, ease: "back.out(1.8)", clearProps: "transform" },
        "-=0.3",
      );
      step(
        "[data-title-text] > *",
        { opacity: 0, x: 24 * direction, duration: 0.5, stagger: 0.09, clearProps: "opacity,transform" },
        "-=0.45",
      );
      step(
        "[data-title-actions] > *",
        { opacity: 0, y: 14, duration: 0.45, stagger: 0.08, clearProps: "opacity,transform" },
        "-=0.35",
      );
    });
    return () => mm.revert();
  }, []);
  return cardRef;
}

// The shell remounts on every page, so the sidebar intro must only play once.
let sidebarIntroPlayed = false;

export function useSidebarIntro() {
  const navRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav || sidebarIntroPlayed) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(nav.querySelectorAll("a, p"), {
        opacity: 0,
        y: 10,
        duration: 0.35,
        ease: "power2.out",
        stagger: 0.025,
        clearProps: "opacity,transform",
        onComplete: () => {
          sidebarIntroPlayed = true;
        },
      });
    });
    return () => mm.revert();
  }, []);
  return navRef;
}

export const subscribeMinute = (notify: () => void) => {
  const timer = window.setInterval(notify, 15_000);
  return () => window.clearInterval(timer);
};

/** Current Muscat date and time for the header; empty during server rendering. */
export function useOmanClock(locale: string) {
  return useSyncExternalStore(
    subscribeMinute,
    () =>
      new Date().toLocaleString(locale, {
        timeZone: OMAN_TIME_ZONE,
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    () => "",
  );
}
