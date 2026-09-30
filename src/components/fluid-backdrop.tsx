"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/animation";
import type { FluidInput } from "@/components/fluid-renderer";
import { isSiteLoading, registerPreparation } from "@/lib/site-readiness";

export function FluidBackdrop() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = root.current;
    const surface = canvas.current;
    const hero = element?.closest<HTMLElement>(".hero");
    if (!element || !surface || !hero) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      let disposed = false;
      let disposeRenderer: (() => void) | null = null;
      const input: FluidInput = { pointer: [0.65, 0.5], velocity: [0, 0], scroll: 0, dark: 0, energy: 0.15, visible: true };
      const tracking = ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom top",
        onUpdate: ({ progress }) => {
          input.scroll = progress;
          // A direct jump can skip the trigger's active range entirely.
          input.visible = progress < 1;
          input.requestRender?.();
        },
      });
      // At the exact top boundary ScrollTrigger is not active yet.
      input.visible = hero.getBoundingClientRect().bottom > 0;
      const preparation = import("./fluid-renderer").then(({ createFluidRenderer }) => {
        if (disposed) return;
        disposeRenderer = createFluidRenderer(surface, input, () => element.classList.remove("fluid-ready"));
        if (disposeRenderer) element.classList.add("fluid-ready");
      }).catch(() => undefined);
      if (isSiteLoading()) registerPreparation("fluid", preparation);
      let pointerFrame = 0;
      let pointerPosition: [number, number] = [0, 0];
      function updatePointer() {
        pointerFrame = 0;
        const bounds = hero!.getBoundingClientRect();
        const next: [number, number] = [
          Math.min(1, Math.max(0, (pointerPosition[0] - bounds.left) / bounds.width)),
          1 - Math.min(1, Math.max(0, (pointerPosition[1] - bounds.top) / bounds.height)),
        ];
        input.velocity = [next[0] - input.pointer[0], next[1] - input.pointer[1]];
        input.pointer = next;
        input.energy = 1;
        input.requestRender?.();
      }
      function pointer(event: PointerEvent) {
        pointerPosition = [event.clientX, event.clientY];
        if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
      }
      function theme() {
        input.dark = document.documentElement.dataset.theme === "dark" ? 1 : 0;
        input.requestRender?.();
      }
      const themes = new MutationObserver(theme);
      themes.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      theme();
      hero.addEventListener("pointermove", pointer, { passive: true });
      hero.addEventListener("pointerdown", pointer, { passive: true });
      return () => {
        disposed = true;
        cancelAnimationFrame(pointerFrame);
        tracking.kill();
        themes.disconnect();
        hero.removeEventListener("pointermove", pointer);
        hero.removeEventListener("pointerdown", pointer);
        disposeRenderer?.();
        element.classList.remove("fluid-ready");
      };
    });
    return () => media.revert();
  }, []);
  return <div ref={root} className="fluid-backdrop" aria-hidden="true"><canvas ref={canvas} /></div>;
}
