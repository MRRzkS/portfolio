import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SpecBlock } from '@/components/spec-block';
import { getProjectBySlug, getProjects } from '@/lib/queries';

/**
 * Rendering: static generation, revalidated on demand.
 *
 * This is the URL a recruiter is most likely to be sent directly, so it has to
 * be indexable and fast on a phone.
 */
export const dynamic = 'force-static';

/** Any slug outside this list returns 404 rather than a runtime lookup, which
 *  is how an unpublished project stays unreachable by guessing its URL. */
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) return { title: 'Not found' };

  return {
    title: project.title,
    description: project.subtitle,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: 'article',
      title: project.title,
      description: project.subtitle,
      url: `/work/${project.slug}`,
      images: project.cover_image_url ? [{ url: project.cover_image_url }] : undefined,
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const projects = await getProjects();
  const position = projects.findIndex((item) => item.slug === project.slug);
  const previous = projects[position - 1];
  const next = projects[position + 1];

  return (
    <>
      <header className="hero masthead">
        <div className="grain" />

        <div className="wrap">
          {project.kind && <div className="badge rise d1">{project.kind}</div>}
          <h1 className="rise d2">{project.title}</h1>
          <p className="lede rise d3">{project.subtitle}</p>

          <div className="actions rise d4">
            {project.repo_url && (
              <a
                className="btn btn-primary"
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View repository &rarr;
              </a>
            )}
            {project.live_url && (
              <a
                className="btn btn-glass"
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open the live site
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="wrap case-grid">
        <div>
          {project.cover_image_url && (
            <div className="cover">
              <Image
                src={project.cover_image_url}
                alt={`${project.title}: ${project.subtitle}`}
                width={1200}
                height={750}
                priority
              />
            </div>
          )}

          <div className="block">
            <span className="eyebrow">Context</span>
            <div className="prose">
              {project.situation.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="block">
            <span className="eyebrow">My role</span>
            <div className="prose">
              <p>{project.task}</p>
            </div>
          </div>

          <div className="block">
            <span className="eyebrow">Process</span>
            <ol className="steps">
              {project.action.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          {project.testimonial && (
            <div className="block">
              <span className="eyebrow">Feedback</span>
              <blockquote className="quote">
                <p>{project.testimonial}</p>
                {project.testimonial_author && <cite>{project.testimonial_author}</cite>}
              </blockquote>
            </div>
          )}
        </div>

        <aside className="aside-col">
          <SpecBlock metrics={project.metrics} />

          {project.limitation && (
            <div className="note">
              <b>Where this stops short</b>
              {project.limitation}
            </div>
          )}

          {project.tech.length > 0 && (
            <div className="built">
              <h4>Built with</h4>
              <div className="chips">
                {project.tech.map((tech) => (
                  <span className="chip" key={tech.id}>
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </main>

      <footer>
        <div className="wrap">
          <div className="pager">
            {previous ? (
              <Link href={`/work/${previous.slug}`}>
                <span className="l">&larr; Previous</span>
                <span className="n">{previous.title}</span>
              </Link>
            ) : (
              <span />
            )}

            {next && (
              <Link href={`/work/${next.slug}`}>
                <span className="l">Next &rarr;</span>
                <span className="n">{next.title}</span>
              </Link>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
