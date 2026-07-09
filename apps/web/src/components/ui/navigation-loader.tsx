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

const MIN_LOADER_VISIBLE_MS = 400;
const LOCALE_SWITCH_BUFFER_MS = 200;
const LOADER_SAFETY_TIMEOUT_MS = 6000;

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
  const pendingNavigationRef = useRef(true);
  const loaderShownAtRef = useRef(Date.now());

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
    hasCompletedInitialLoad.current = true;
    clearSafetyTimer();
  }

  function hideAfterMinTime() {
    clearHideTimer();

    const elapsed = Date.now() - loaderShownAtRef.current;
    const waitMs = Math.max(0, MIN_LOADER_VISIBLE_MS - elapsed);

    hideTimer.current = window.setTimeout(() => {
      requestAnimationFrame(() => {
        hideLoader();
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

  // Initial load safety timeout
  useEffect(() => {
    safetyTimer.current = window.setTimeout(() => {
      if (pendingNavigationRef.current) {
        hideLoader();
      }
    }, LOADER_SAFETY_TIMEOUT_MS);

    return () => clearSafetyTimer();
  }, []);

  // Listen for route ready (both initial load and navigations)
  useEffect(() => {
    function handleRouteReady() {
      if (!pendingNavigationRef.current) {
        return;
      }

      hideAfterMinTime();
    }

    window.addEventListener(ROUTE_READY_EVENT, handleRouteReady);
    return () => window.removeEventListener(ROUTE_READY_EVENT, handleRouteReady);
  }, []);

  // Locale switch
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
        hideAfterMinTime();
      });
    });
  }, [locale]);

  // Manual showPageLoader() calls
  useEffect(() => {
    function handleNavigationStart() {
      showLoaderForNavigation();
    }

    window.addEventListener(PAGE_LOADER_START_EVENT, handleNavigationStart);
    return () =>
      window.removeEventListener(PAGE_LOADER_START_EVENT, handleNavigationStart);
  }, []);

  // Intercept internal link clicks
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
