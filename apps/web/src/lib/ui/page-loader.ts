export const PAGE_LOADER_START_EVENT = "planblue:navigation-start";

export function showPageLoader(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(PAGE_LOADER_START_EVENT));
}
