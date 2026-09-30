import { pausePageScroll, resumePageScroll } from "@/lib/page-scroll";

let active: ViewTransition | null = null;
let version = 0;

// Page navigation releases the theme snapshot before taking its own snapshot.
export function finishThemeTransition() {
  const wasActive = Boolean(active);
  version += 1;
  active?.skipTransition();
  active = null;
  document.documentElement.classList.remove("theme-transitioning");
  if (wasActive && !document.documentElement.classList.contains("route-transitioning")) resumePageScroll();
  document.dispatchEvent(new Event("theme-ready"));
}

export function revealTheme(button: HTMLButtonElement, update: () => void) {
  finishThemeTransition();
  const root = document.documentElement;
  if (
    !document.startViewTransition ||
    root.classList.contains("route-transitioning") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    update();
    return;
  }

  const bounds = button.getBoundingClientRect();
  const x = bounds.left + bounds.width / 2;
  const y = bounds.top + bounds.height / 2;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  root.style.setProperty("--theme-x", `${x}px`);
  root.style.setProperty("--theme-y", `${y}px`);
  root.style.setProperty("--theme-radius", `${Math.ceil(radius)}px`);
  root.classList.add("theme-transitioning");
  pausePageScroll();
  const currentVersion = version;
  try {
    const transition = document.startViewTransition(() => {
      if (currentVersion === version) update();
    });
    active = transition;
    transition.finished.catch(() => undefined).finally(() => {
      if (active !== transition) return;
      active = null;
      root.classList.remove("theme-transitioning");
      if (!root.classList.contains("route-transitioning")) resumePageScroll();
      document.dispatchEvent(new Event("theme-ready"));
    });
  } catch {
    root.classList.remove("theme-transitioning");
    if (!root.classList.contains("route-transitioning")) resumePageScroll();
    document.dispatchEvent(new Event("theme-ready"));
    update();
  }
}
