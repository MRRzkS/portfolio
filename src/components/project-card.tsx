import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Tilt } from "./motion";
import { type Project } from "@/lib/content";
export function ProjectVisual({
  project,
  priority = false,
}: {
  project: Project;
  priority?: boolean;
}) {
  if (project.image)
    return (
      <div className={`project-visual visual-${project.slug}`}>
        <Image
          src={project.image}
          alt={`${project.name} application interface`}
          width={1900}
          height={970}
          sizes="(max-width: 700px) 90vw, (max-width: 1100px) 80vw, 65vw"
          priority={priority}
        />
      </div>
    );
  return null;
}
export function ProjectCard({
  project,
  large = false,
  index = 0,
}: {
  project: Project;
  large?: boolean;
  index?: number;
}) {
  return (
    <Tilt className={`project-card ${large ? "large" : ""}`}>
      <Link
        href={`/work/${project.slug}`}
        className="project-card-link"
        aria-label={`Read ${project.name} case study`}
      >
        <div className="project-card-top">
          <span className="eyebrow">
            {String(index + 1).padStart(2, "0")} / {project.category}
          </span>
          <span className="card-arrow">
            <ArrowUpRight size={22} />
          </span>
        </div>
        <div className="project-card-copy">
          <h3>{project.name}</h3>
          <p>{project.summary}</p>
        </div>
        <ProjectVisual project={project} />
        <div className="project-card-bottom">
          <span>{project.stack.slice(0, 3).join(" / ")}</span>
          <span>
            <strong>{project.metrics[0].value}</strong>{" "}
            {project.metrics[0].label}
          </span>
        </div>
      </Link>
    </Tilt>
  );
}
