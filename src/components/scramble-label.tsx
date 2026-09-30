"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/animation";

export function ScrambleLabel({ text }: { text: string }) {
  const label = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = label.current;
    if (!element) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(element, {
        duration: 0.75,
        scrambleText: { text, chars: "01/.", speed: 0.25, revealDelay: 0.08 },
        scrollTrigger: { trigger: element, start: "top 94%", once: true },
      });
      return () => { element.textContent = text; };
    });
    return () => media.revert();
  }, [text]);
  return (
    <span className="scramble-label">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" ref={label}>{text}</span>
    </span>
  );
}
