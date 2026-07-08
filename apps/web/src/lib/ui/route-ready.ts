export const ROUTE_READY_EVENT = "planblue:route-ready";

export function notifyRouteReady(routeKey: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(ROUTE_READY_EVENT, {
      detail: { routeKey },
    }),
  );
}
