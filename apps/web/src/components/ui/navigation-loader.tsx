"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { PageLoader } from "@/components/ui/page-loader";
import { PAGE_LOADER_START_EVENT } from "@/lib/ui/page-loader";

const INITIAL_DELAY_MS = 900;
const NAVIGATION_DELAY_MS = 500;

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
  const [visible, setVisible] = useState(true);
  const isFirstLoad = useRef(true);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
    }

    const delay = isFirstLoad.current ? INITIAL_DELAY_MS : NAVIGATION_DELAY_MS;
    isFirstLoad.current = false;

    hideTimer.current = window.setTimeout(() => {
      setVisible(false);
    }, delay);

    return () => {
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current);
      }
    };
  }, [pathname]);

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
