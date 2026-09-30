"use client";

import { useEffect, useId, useRef, type PointerEvent } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { gsap } from "@/lib/animation";

export function GooeyLink({ href, label }: { href: string; label: string }) {
  const filterId = useId().replaceAll(":", "");
  const root = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const drops = root.current?.querySelectorAll(".gooey-drop");
    return () => { if (drops) gsap.killTweensOf(drops); };
  }, []);
  function reactToTouch(event?: PointerEvent<HTMLAnchorElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const element = root.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    const horizontal = event ? (event.clientX - bounds.left - bounds.width / 2) * 0.4 + 14 : 15;
    const vertical = event ? (event.clientY - bounds.top - bounds.height / 2) * 0.4 - 8 : -12;
    gsap.to(element.querySelectorAll(".gooey-drop"), {
      x: (index) => Math.max(-24, Math.min(24, horizontal)) * (index ? -0.6 : 1),
      y: (index) => Math.max(-24, Math.min(24, vertical)) * (index ? -0.6 : 1),
      scale: 1,
      duration: 0.4,
      ease: "back.out(1.7)",
      overwrite: true,
    });
  }
  function reset() {
    if (!root.current) return;
    gsap.to(root.current.querySelectorAll(".gooey-drop"), { x: 0, y: 0, scale: 0.5, duration: 0.5, ease: "power3.out", overwrite: true });
  }
  return (
    <Link ref={root} href={href} className="circle-link gooey-link" aria-label={label}
      onPointerMove={reactToTouch} onPointerDown={reactToTouch} onFocus={() => reactToTouch()} onPointerLeave={reset} onBlur={reset}>
      <svg width="0" height="0" className="gooey-definitions" aria-hidden="true">
        <defs><filter id={filterId} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="soft" />
          <feColorMatrix in="soft" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="joined" />
          <feBlend in="SourceGraphic" in2="joined" />
        </filter></defs>
      </svg>
      <span className="gooey-surface" style={{ filter: `url(#${filterId})` }} aria-hidden="true">
        <span className="gooey-core" /><span className="gooey-drop" /><span className="gooey-drop" />
      </span>
      <ArrowUpRight size={30} />
    </Link>
  );
}
