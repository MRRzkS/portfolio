"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/animation";

export function PixelReveal({ children, reverse = false }: { children: ReactNode; reverse?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const pixels = element.querySelectorAll<HTMLElement>(".reveal-pixel");
      element.classList.add("pixel-ready");
      gsap.to(pixels, {
        scaleX: 0,
        opacity: 0,
        duration: 0.7,
        ease: "power3.inOut",
        stagger: (index) => {
          const column = index % 12;
          const row = Math.floor(index / 12);
          const distance = reverse ? Math.abs(column - 5.5) : 5.5 - Math.abs(column - 5.5);
          return distance * 0.065 + (row % 3) * 0.045;
        },
        scrollTrigger: { trigger: element, start: "top 90%", end: "top 35%", scrub: 0.35 },
      });
      return () => element.classList.remove("pixel-ready");
    });
    return () => media.revert();
  }, [reverse]);
  return (
    <div ref={root} className="pixel-reveal">
      {children}
      <div className="pixel-mask" aria-hidden="true">
        {Array.from({ length: 72 }, (_, index) => (
          <span className="reveal-pixel" key={index} style={{ transformOrigin: index % 12 < 6 ? "right center" : "left center" }} />
        ))}
      </div>
    </div>
  );
}
