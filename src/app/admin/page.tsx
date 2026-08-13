import Link from 'next/link';
import { DeleteButton, PublishToggle } from '@/components/admin/project-controls';
import { getAllProjects } from '@/lib/admin-queries';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const projects = await getAllProjects();
  const published = projects.filter((project) => project.is_published).length;

  return (
    <>
      <div className="admin-head">
        <div>
          <span className="admin-eyebrow">Projects</span>
          <h1>
            {published} published, {projects.length - published} in draft
          </h1>
        </div>
        <Link className="admin-btn primary" href="/admin/projects/new">
          Add a project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="admin-card empty">
          <h2>Nothing here yet</h2>
          <p className="muted">The public site will show an empty work section until you add one.</p>
          <Link className="admin-btn primary" href="/admin/projects/new">
            Add the first project
          </Link>
        </div>
      ) : (
        <ul className="project-list">
          {projects.map((project) => (
            <li className="project-row" key={project.id}>
              <div className="project-main">
                <div className="project-title">
                  <Link href={`/admin/projects/${project.id}`}>{project.title}</Link>
                  <PublishToggle
                    projectId={project.id}
                    slug={project.slug}
                    isPublished={project.is_published}
                  />
                </div>
                <p className="muted">{project.subtitle}</p>
                <p className="project-meta">
                  /work/{project.slug} &nbsp;&middot;&nbsp; order {project.sort_order}{' '}
                  &nbsp;&middot;&nbsp; {project.metrics.length} metrics
                  {project.metrics.length === 0 && (
                    <em className="warn"> &mdash; no measured result yet</em>
                  )}
                </p>
              </div>

              <div className="project-controls">
                <Link className="admin-btn ghost small" href={`/admin/projects/${project.id}`}>
                  Edit
                </Link>
                {project.is_published && (
                  <Link
                    className="admin-btn ghost small"
                    href={`/work/${project.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </Link>
                )}
                <DeleteButton
                  projectId={project.id}
                  slug={project.slug}
                  title={project.title}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
