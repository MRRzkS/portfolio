"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/animation";

export function StairBackdrop() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(element.children, { scaleY: 0, opacity: 0 }, {
        scaleY: 1,
        opacity: 1,
        duration: 1,
        stagger: { each: 0.08, from: "end" },
        ease: "power3.inOut",
        scrollTrigger: { trigger: element.parentElement, start: "top 95%", end: "top 25%", scrub: 0.6 },
      });
    });
    return () => media.revert();
  }, []);
  return <div ref={root} className="stair-backdrop" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <span key={index} />)}</div>;
}
