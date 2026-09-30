import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Info } from "lucide-react";
import { projects } from "@/lib/content";
import { ProjectVisual } from "@/components/project-card";
import { Reveal } from "@/components/motion";
import { ActionLink } from "@/components/ui";
import { PixelReveal } from "@/components/pixel-reveal";
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  return {
    title: project?.name ?? "Project not found",
    description: project?.summary,
  };
}
// Each case study is generated at build time from the reviewed source snapshot.
export default async function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const nextProject =
    projects[(projects.indexOf(project) + 1) % projects.length];
  return (
    <>
      <section className="case-intro container">
        <Link href="/work" className="back-link">
          <ArrowLeft size={15} /> All work
        </Link>
        <div className="case-heading">
          <p className="eyebrow">
            {project.featured ? "FEATURED PROJECT" : "SIDE PROJECT"} /{" "}
            {project.category}
          </p>
          <h1>
            {project.name}
            <span>.</span>
          </h1>
          <p className="case-summary">{project.summary}</p>
          <div className="case-actions">
            {project.demo ? (
              <ActionLink href={project.demo} primary external>
                {project.demoLabel ?? "View live project"}
              </ActionLink>
            ) : null}
            <ActionLink href={project.repository} external>
              Explore the code
            </ActionLink>
          </div>
        </div>
        <div className="case-meta">
          <div>
            <span className="eyebrow">MY ROLE</span>
            <p>{project.role}</p>
          </div>
          <div>
            <span className="eyebrow">TOOLS</span>
            <p>{project.stack.join(" · ")}</p>
          </div>
        </div>
      </section>
      <div className="container case-image">
        <PixelReveal reverse={projects.indexOf(project) % 2 === 1}>
          <ProjectVisual project={project} priority />
        </PixelReveal>
      </div>
      <section className="container case-metrics" aria-label="Project numbers">
        {project.metrics.map((metric) => (
          <div key={metric.label}>
            <strong>{metric.value}</strong>
            <p>{metric.label}</p>
            <details className="metric-source">
              <summary>
                <Info size={13} /> More details
              </summary>
              <p>{metric.detail}</p>
            </details>
          </div>
        ))}
      </section>
      <section className="case-story container">
        <Reveal className="story-row">
          <p className="eyebrow">01 / THE CHALLENGE</p>
          <div>
            <h2>
              {project.eyebrow
                .toLowerCase()
                .replace(/^./, (character) => character.toUpperCase())}
              .
            </h2>
            <p>{project.challenge}</p>
          </div>
        </Reveal>
        <Reveal className="story-row">
          <p className="eyebrow">02 / THE APPROACH</p>
          <div>
            <h2>How I built it.</h2>
            {project.approach.map((paragraph, index) => (
              <div className="approach-step" key={paragraph}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{paragraph}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal className="story-row">
          <p className="eyebrow">03 / THE RESULT</p>
          <div>
            <h2>What was delivered.</h2>
            <p>{project.outcome}</p>
            <div className="project-note">
              <Info size={18} />
              <div>
                <h3>Good to know</h3>
                <p>{project.note}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
      <section className="next-project container">
        <p className="eyebrow">KEEP EXPLORING</p>
        <Link href={`/work/${nextProject.slug}`}>
          <h2>{nextProject.name}</h2>
          <ArrowUpRight size={36} />
        </Link>
      </section>
    </>
  );
}
