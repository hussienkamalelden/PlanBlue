"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useLayoutEffect } from "react";

import { notifyRouteReady } from "@/lib/ui/route-ready";

export function RouteReadyNotifier() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;

  useLayoutEffect(() => {
    notifyRouteReady(routeKey);
  }, [routeKey]);

  return null;
}
