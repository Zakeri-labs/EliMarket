"use client";

import { useSyncExternalStore } from "react";
import { HomeDesktop } from "@/app/(storefront)/_components/HomeDesktop";
import { HomeMobile } from "@/app/(storefront)/_components/HomeMobile";

const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function HomeView() {
  const isDesktop = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return isDesktop ? <HomeDesktop /> : <HomeMobile />;
}
