"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { PageLoader } from "@/components/ui/page-loader";
import { PAGE_LOADER_START_EVENT } from "@/lib/ui/page-loader";
import { useLocaleStore } from "@/stores/locale-store";

const INITIAL_DELAY_MS = 900;
const NAVIGATION_DELAY_MS = 500;
const LOCALE_SWITCH_DELAY_MS = 450;

function isInternalNavigationLink(anchor: HTMLAnchorElement, pathname: string) {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  if (anchor.target === "_blank") {
    return false;
  }

  const url = new URL(href, window.location.origin);
  if (url.origin !== window.location.origin) {
    return false;
  }

  return url.pathname !== pathname || url.search !== window.location.search;
}

export function NavigationLoader() {
  const pathname = usePathname();
  const locale = useLocaleStore((state) => state.locale);
  const [visible, setVisible] = useState(true);
  const isFirstLoad = useRef(true);
  const prevLocaleRef = useRef(locale);
  const hideTimer = useRef<number | null>(null);

  function scheduleHide(delay: number) {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
    }

    hideTimer.current = window.setTimeout(() => {
      setVisible(false);
    }, delay);
  }

  useEffect(() => {
    const delay = isFirstLoad.current ? INITIAL_DELAY_MS : NAVIGATION_DELAY_MS;
    isFirstLoad.current = false;
    scheduleHide(delay);

    return () => {
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current);
      }
    };
  }, [pathname]);

  useEffect(() => {
    if (prevLocaleRef.current === locale) {
      return;
    }

    prevLocaleRef.current = locale;
    setVisible(true);
    scheduleHide(LOCALE_SWITCH_DELAY_MS);

    return () => {
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current);
      }
    };
  }, [locale]);

  useEffect(() => {
    function handleNavigationStart() {
      setVisible(true);
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

      const anchor = target.closest("a");
      if (!anchor || !isInternalNavigationLink(anchor, pathname)) {
        return;
      }

      setVisible(true);
    }

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [pathname]);

  return <PageLoader visible={visible} />;
}
