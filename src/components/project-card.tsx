import Link from 'next/link';
import type { ProjectWithTech } from '@/lib/types';

interface ProjectCardProps {
  project: ProjectWithTech;
  index: number;
}

/** Cards cycle through four accent washes so a fifth project does not land
 *  without one. */
const ACCENTS = ['c1', 'c2', 'c3', 'c4'];

export function ProjectCard({ project, index }: ProjectCardProps) {
  const [headline, secondary] = project.metrics;

  // The card carries one measured number; the case study carries the rest.
  const caption = [
    headline?.label,
    secondary && `${secondary.value} ${secondary.label.toLowerCase()}`,
  ]
    .filter(Boolean)
    .join(' \u00b7 ');

  return (
    <Link className={`card ${ACCENTS[index % ACCENTS.length]}`} href={`/work/${project.slug}`}>
      <div className="card-top">
        <span className="num">{String(index + 1).padStart(2, '0')}</span>
        {project.kind && <span className="kind">{project.kind}</span>}
      </div>

      <h3>{project.title}</h3>
      <p className="desc">{project.subtitle}</p>

      {headline && (
        <div className="metric">
          <span className="v">{headline.value}</span>
          <span className="k">{caption}</span>
        </div>
      )}

      <div className="chips">
        {project.tech.map((tech) => (
          <span className="chip" key={tech.id}>
            {tech.name}
          </span>
        ))}
      </div>

      <span className="go">Read case study &rarr;</span>
    </Link>
  );
}
