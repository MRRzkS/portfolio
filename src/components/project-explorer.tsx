"use client";
import { useState } from "react";
import { projects } from "@/lib/content";
import { ProjectCard } from "./project-card";
const categories = [
  "All work",
  "Applied AI",
  "Systems",
  "Developer Tools",
  "Web Experiences",
] as const;
export function ProjectExplorer() {
  const [category, setCategory] = useState<string>("All work");
  const visible = projects.filter(
    (project) => category === "All work" || project.category === category,
  );
  return (
    <>
      <div className="filter-row">
        <div role="group" aria-label="Filter projects" className="filters">
          {categories.map((item) => (
            <button
              key={item}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
              {item === "All work" ? <span>05</span> : null}
            </button>
          ))}
        </div>
        <span className="filter-count" aria-live="polite">
          {String(visible.length).padStart(2, "0")} projects
        </span>
      </div>
      <div className="projects-grid explorer-grid">
        {visible.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={projects.indexOf(project)}
            large={
              project.featured &&
              category === "All work" &&
              project.slug === "briefly-ai"
            }
          />
        ))}
      </div>
    </>
  );
}
