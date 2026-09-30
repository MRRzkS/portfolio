const preparations = new Map<string, Promise<unknown>>();

export function isSiteLoading() {
  return document.documentElement.dataset.boot === "loading";
}

export function registerPreparation(name: string, preparation: Promise<unknown>) {
  preparations.set(name, preparation);
}

export async function waitForPreparations() {
  await Promise.allSettled([...preparations.values()]);
  preparations.clear();
}

export function waitForSiteReady() {
  if (!isSiteLoading()) return Promise.resolve();
  return new Promise<void>((resolve) => {
    document.addEventListener("site-ready", () => resolve(), { once: true });
  });
}

export function isViewTransitionActive() {
  return document.documentElement.matches(".route-transitioning, .theme-transitioning");
}

export async function waitForPageReady() {
  await waitForSiteReady();
  if (!document.documentElement.classList.contains("route-transitioning")) return;
  await new Promise<void>((resolve) => {
    document.addEventListener("route-ready", () => resolve(), { once: true });
  });
}
