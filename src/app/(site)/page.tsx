import { About, SiteFooter } from '@/components/about';
import { Hero } from '@/components/hero';
import { ProjectCard } from '@/components/project-card';
import { TechStack } from '@/components/tech-stack';
import { getProjects, getTechStack } from '@/lib/queries';

/**
 * Rendering: static generation, revalidated on demand.
 *
 * The page must be indexed and must preview correctly when a recruiter shares
 * the link, and its content changes only when the owner saves in the dashboard.
 * There is nothing per-request here to justify rendering it per request.
 */
export const dynamic = 'force-static';

export default async function HomePage() {
  const [projects, tech] = await Promise.all([getProjects(), getTechStack()]);

  return (
    <>
      <Hero />

      <section id="work">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">01 / Selected work</span>
            <h2>
              {projects.length} projects, {projects.length} different problems.
            </h2>
            <p>
              Curated rather than collected. Each one exists because it taught me something I could
              not have read.
            </p>
          </div>

          <div className="cards">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>
      </section>

      <TechStack items={tech} />
      <About projectCount={projects.length} />
      <SiteFooter />
    </>
  );
}
