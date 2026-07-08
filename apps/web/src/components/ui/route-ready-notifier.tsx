"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

import { notifyRouteReady } from "@/lib/ui/route-ready";

export function RouteReadyNotifier() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const isFirstRender = useRef(true);

  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    notifyRouteReady(routeKey);
  }, [routeKey]);

  return null;
}
