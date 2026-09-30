"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/animation";

export function StoryGradient({ text }: { text: string }) {
  const root = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(element.querySelectorAll(".story-word"), { opacity: 0.24, "--word-light": "0%" }, {
        opacity: 1,
        "--word-light": "100%",
        duration: 1,
        stagger: 0.15,
        ease: "none",
        scrollTrigger: { trigger: element, start: "top 85%", end: "bottom 40%", scrub: 0.5 },
      });
    });
    return () => media.revert();
  }, []);
  return <p ref={root} className="story-gradient">
    <span className="sr-only">{text}</span>
    <span aria-hidden="true">{text.split(" ").map((word, index) => <span key={index} className="story-word">{word}{" "}</span>)}</span>
  </p>;
}
