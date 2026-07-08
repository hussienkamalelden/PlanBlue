"use client";

import { useEffect, useRef, useState } from "react";

import { PageLoader } from "@/components/ui/page-loader";
import {
  PAGE_LOADER_START_EVENT,
  setPageLoaderActive,
} from "@/lib/ui/page-loader";
import { ROUTE_READY_EVENT } from "@/lib/ui/route-ready";
import {
  isInsideSliderCarousel,
  isSliderNavigationBlocked,
} from "@/lib/shop/slider-drag-state";
import { useLocaleStore } from "@/stores/locale-store";

const INITIAL_DELAY_MS = 900;
const POST_ROUTE_BUFFER_MS = 120;
const MIN_LOADER_VISIBLE_MS = 400;
const LOCALE_SWITCH_BUFFER_MS = 200;
const LOADER_SAFETY_TIMEOUT_MS = 4000;

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
  const locale = useLocaleStore((state) => state.locale);
  const [visible, setVisible] = useState(true);
  const hasCompletedInitialLoad = useRef(false);
  const prevLocaleRef = useRef(locale);
  const hideTimer = useRef<number | null>(null);
  const safetyTimer = useRef<number | null>(null);
  const pendingNavigationRef = useRef(false);
  const loaderShownAtRef = useRef(0);

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

  function hideLoader() {
    setVisible(false);
    setPageLoaderActive(false);
    pendingNavigationRef.current = false;
    clearSafetyTimer();
  }

  function hideAfterPaint(bufferMs: number) {
    clearHideTimer();

    const elapsed = Date.now() - loaderShownAtRef.current;
    const waitMs = Math.max(bufferMs, MIN_LOADER_VISIBLE_MS - elapsed);

    hideTimer.current = window.setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          hideLoader();
        });
      });
    }, waitMs);
  }

  function showLoaderForNavigation() {
    loaderShownAtRef.current = Date.now();
    setVisible(true);
    setPageLoaderActive(true);
    pendingNavigationRef.current = true;
    clearHideTimer();
    clearSafetyTimer();

    safetyTimer.current = window.setTimeout(() => {
      if (pendingNavigationRef.current) {
        hideLoader();
      }
    }, LOADER_SAFETY_TIMEOUT_MS);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      hasCompletedInitialLoad.current = true;
      hideLoader();
    }, INITIAL_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    function handleRouteReady() {
      if (!hasCompletedInitialLoad.current || !pendingNavigationRef.current) {
        return;
      }

      hideAfterPaint(POST_ROUTE_BUFFER_MS);
    }

    window.addEventListener(ROUTE_READY_EVENT, handleRouteReady);
    return () => window.removeEventListener(ROUTE_READY_EVENT, handleRouteReady);
  }, []);

  useEffect(() => {
    if (prevLocaleRef.current === locale) {
      return;
    }

    prevLocaleRef.current = locale;

    if (!hasCompletedInitialLoad.current) {
      return;
    }

    showLoaderForNavigation();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        hideAfterPaint(LOCALE_SWITCH_BUFFER_MS);
      });
    });
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
