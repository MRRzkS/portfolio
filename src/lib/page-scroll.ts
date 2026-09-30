import type Lenis from "lenis";

let smoothScroller: Lenis | null = null;

export function registerPageScroller(scroller: Lenis) {
  smoothScroller = scroller;
  return () => { if (smoothScroller === scroller) smoothScroller = null; };
}

export function pausePageScroll() {
  smoothScroller?.stop();
}

// Reset both native scroll and Lenis inertia before the incoming snapshot is taken.
export function resetPageScroll() {
  smoothScroller?.resize();
  smoothScroller?.scrollTo(0, { immediate: true, force: true });
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

export function resumePageScroll(hash = "") {
  smoothScroller?.resize();
  smoothScroller?.start();
  const anchor = hash ? document.getElementById(hash.slice(1)) : null;
  if (!anchor) return;
  if (smoothScroller) smoothScroller.scrollTo(anchor, { offset: -100 });
  else anchor.scrollIntoView({ behavior: "smooth", block: "start" });
}
