"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { PageLoader } from "@/components/ui/page-loader";
import { PAGE_LOADER_START_EVENT } from "@/lib/ui/page-loader";
import {
  isInsideSliderCarousel,
  isSliderNavigationBlocked,
} from "@/lib/shop/slider-drag-state";
import { useLocaleStore } from "@/stores/locale-store";

const INITIAL_DELAY_MS = 900;
const NAVIGATION_DELAY_MS = 500;
const LOCALE_SWITCH_DELAY_MS = 450;
const LOADER_SAFETY_TIMEOUT_MS = 2500;

function isInternalNavigationLink(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  if (anchor.target === "_blank") {
    return false;
  }

  const targetUrl = new URL(href, window.location.href);
  const currentUrl = new URL(window.location.href);

  if (targetUrl.origin !== currentUrl.origin) {
    return false;
  }

  return (
    targetUrl.pathname !== currentUrl.pathname ||
    targetUrl.search !== currentUrl.search ||
    targetUrl.hash !== currentUrl.hash
  );
}

function shouldShowLoaderForClick(target: Element) {
  const anchor = target.closest("a");
  if (!anchor || !isInternalNavigationLink(anchor)) {
    return false;
  }

  if (isInsideSliderCarousel(anchor) && isSliderNavigationBlocked()) {
    return false;
  }

  return true;
}

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const locale = useLocaleStore((state) => state.locale);
  const [visible, setVisible] = useState(true);
  const isFirstLoad = useRef(true);
  const prevLocaleRef = useRef(locale);
  const hideTimer = useRef<number | null>(null);
  const safetyTimer = useRef<number | null>(null);
  const pendingNavigationRef = useRef(false);

  function clearHideTimer() {
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }

  function clearSafetyTimer() {
    if (safetyTimer.current !== null) {
      window.clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }
  }

  function scheduleHide(delay: number) {
    clearHideTimer();
    pendingNavigationRef.current = false;
    clearSafetyTimer();

    hideTimer.current = window.setTimeout(() => {
      setVisible(false);
    }, delay);
  }

  function showLoaderForNavigation() {
    setVisible(true);
    pendingNavigationRef.current = true;
    clearSafetyTimer();

    safetyTimer.current = window.setTimeout(() => {
      if (pendingNavigationRef.current) {
        pendingNavigationRef.current = false;
        setVisible(false);
      }
    }, LOADER_SAFETY_TIMEOUT_MS);
  }

  useEffect(() => {
    const delay = isFirstLoad.current ? INITIAL_DELAY_MS : NAVIGATION_DELAY_MS;
    isFirstLoad.current = false;
    scheduleHide(delay);

    return () => {
      clearHideTimer();
    };
  }, [pathname, searchKey]);

  useEffect(() => {
    if (prevLocaleRef.current === locale) {
      return;
    }

    prevLocaleRef.current = locale;
    showLoaderForNavigation();
    scheduleHide(LOCALE_SWITCH_DELAY_MS);

    return () => {
      clearHideTimer();
      clearSafetyTimer();
    };
  }, [locale]);

  useEffect(() => {
    function handleNavigationStart() {
      showLoaderForNavigation();
    }

    window.addEventListener(PAGE_LOADER_START_EVENT, handleNavigationStart);
    return () =>
      window.removeEventListener(PAGE_LOADER_START_EVENT, handleNavigationStart);
  }, []);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      if (!shouldShowLoaderForClick(target)) {
        return;
      }

      showLoaderForNavigation();
    }

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, []);

  return <PageLoader visible={visible} />;
}
