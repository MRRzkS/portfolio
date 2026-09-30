"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/animation";
import { ProjectCard } from "@/components/project-card";
import type { Project } from "@/lib/content";

export function ProjectStack({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(min-width: 900px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)", () => {
      const cards = root.current?.querySelectorAll<HTMLElement>(".stack-card") ?? [];
      cards.forEach((card, index) => {
        const next = cards[index + 1];
        if (!next) return;
        gsap.to(card.querySelector(".stack-card-shell"), {
          scale: 0.94,
          rotationX: -3,
          ease: "none",
          scrollTrigger: { trigger: next, start: "top 80%", end: "top 140px", scrub: 0.5 },
        });
      });
    });
    return () => media.revert();
  }, []);
  return (
    <div ref={root} className="project-stack">
      {projects.map((project, index) => (
        <div key={project.slug} className="stack-card" style={{ top: `${110 + index * 18}px` }}>
          <div className="stack-card-shell">
            <ProjectCard project={project} large index={index} />
          </div>
        </div>
      ))}
    </div>
  );
}
