"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/animation";
import { registerPageScroller } from "@/lib/page-scroll";
import { isSiteLoading } from "@/lib/site-readiness";

export function SmoothScroll() {
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({
        duration: 1.1,
        smoothWheel: true,
        syncTouch: false,
        stopInertiaOnNavigate: true,
        anchors: { offset: -100 },
      });
      const tick = (seconds: number) => lenis.raf(seconds * 1000);
      const unregister = registerPageScroller(lenis);
      if (isSiteLoading()) lenis.stop();
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        unregister();
        lenis.destroy();
      };
    });
    return () => media.revert();
  }, []);
  return null;
}
