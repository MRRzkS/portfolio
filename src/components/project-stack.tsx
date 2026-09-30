"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/animation";
import { ProjectCard } from "@/components/project-card";
import type { Project } from "@/lib/content";
import { waitForSiteReady } from "@/lib/site-readiness";

export function ProjectStack({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    let disposed = false;
    void Promise.all([document.fonts.ready, waitForSiteReady()]).then(() => {
      if (disposed) return;
    media.add("(min-width: 900px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)", () => {
      const element = root.current;
      if (!element) return;
      const cards = Array.from(element.querySelectorAll<HTMLElement>(".stack-card"));
      const offsets: number[] = [];
      function measure() {
        const gap = parseFloat(getComputedStyle(element!).rowGap) || 0;
        let offset = 0;
        cards.forEach((card, index) => {
          offsets[index] = offset;
          offset += card.offsetHeight + gap;
        });
      }
      measure();
      const visibility = ScrollTrigger.create({
        trigger: element, start: "top bottom", end: "bottom top",
        onToggle: ({ isActive }) => element.classList.toggle("stack-active", isActive),
      });
      element.classList.toggle("stack-active", visibility.isActive);
      cards.forEach((card, index) => {
        const next = cards[index + 1];
        if (!next) return;
        gsap.to(card.querySelector(".stack-card-shell"), {
          scale: 0.96,
          force3D: true,
          ease: "none",
          // Measure normal grid tracks, never the moving sticky card position.
          scrollTrigger: {
            trigger: element,
            start: () => `top+=${offsets[index + 1]} 80%`,
            end: () => `top+=${offsets[index + 1]} ${110 + (index + 1) * 18}px`,
            onRefreshInit: measure,
            scrub: true,
          },
        });
      });
      return () => element.classList.remove("stack-active");
    });
    });
    return () => { disposed = true; media.revert(); };
  }, []);
  return (
    <div ref={root} className="project-stack">
      {projects.map((project, index) => (
        <div key={project.slug} className="stack-card" style={{ top: `${110 + index * 18}px` }}>
          <div className="stack-card-shell">
            <ProjectCard project={project} large index={index} tilt={false} />
          </div>
        </div>
      ))}
    </div>
  );
}
