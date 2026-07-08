export const PAGE_LOADER_START_EVENT = "planblue:navigation-start";

export function setPageLoaderActive(active: boolean): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("planblue-loading", active);

  if (!active) {
    document.documentElement.classList.add("planblue-hydrated");
  }
}

export function markPageLoaderHydrated(): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.add("planblue-hydrated");
}

export function showPageLoader(): void {
  if (typeof window === "undefined") {
    return;
  }

  setPageLoaderActive(true);
  window.dispatchEvent(new CustomEvent(PAGE_LOADER_START_EVENT));
}
