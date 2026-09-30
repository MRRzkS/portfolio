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
