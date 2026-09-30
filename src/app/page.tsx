import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { profile, projects } from "@/lib/content";
import { ProjectStack } from "@/components/project-stack";
import { ProjectGallery } from "@/components/project-gallery";
import { FluidBackdrop } from "@/components/fluid-backdrop";
import { StairBackdrop } from "@/components/stair-backdrop";
import { StoryGradient } from "@/components/story-gradient";
import { Reveal } from "@/components/motion";
import { ActionLink, SectionHeading } from "@/components/ui";
import { ContactBanner } from "@/components/footer";
// Public, build-time content is statically generated for fast, indexable first paint.
export default function Home() {
  return (
    <>
      <section className="hero container">
        <div className="hero-top">
          <p className="eyebrow">SOFTWARE ENGINEER & FULL-STACK DEVELOPER</p>
          <span className="availability">
            <span className="status-dot" /> Open to opportunities
          </span>
        </div>
        <div className="hero-layout">
          <div className="hero-copy">
            <p className="hero-intro">Hi, I’m Razak.</p>
            <h1>
              Clear
              <br />
              code.
              <br />
              <span>
                Real
                <br />
                results.
              </span>
            </h1>
            <p className="hero-description">
              I build websites and apps that are easy to use.
              <br />
              From the first idea to the final product.
            </p>
            <div className="hero-actions">
              <ActionLink href="/work" primary>
                Explore my work
              </ActionLink>
              <ActionLink href={profile.cv} external>
                Download résumé
              </ActionLink>
            </div>
          </div>
          <div className="hero-portrait">
            <span className="portrait-index">
              01 · THE PERSON BEHIND THE CODE
            </span>
            <div className="portrait-frame">
              <FluidBackdrop />
              <Image
                src="/razak-no_bg.png"
                alt="Portrait of Razak"
                width={1230}
                height={1278}
                priority
                sizes="(max-width: 700px) 85vw, 42vw"
              />
              <span className="portrait-line" />
            </div>
            <div className="portrait-caption">
              <span>Razak</span>
              <span>
                Depok, Indonesia <ArrowUpRight size={12} />
              </span>
            </div>
            <span className="vertical-label">CRAFT · CLARITY · INTENTION</span>
          </div>
        </div>
        <div className="hero-baseline">
          <span>Good software starts with a clear idea.</span>
          <a href="#selected-work" className="scroll-link">
            SCROLL TO EXPLORE <ArrowDown size={14} />
          </a>
        </div>
      </section>
      <Reveal>
        <section
          className="stats-strip container"
          aria-label="Experience in numbers"
        >
          <div>
            <strong>
              05<span> websites</span>
            </strong>
            <p>Delivered for real clients</p>
          </div>
          <div>
            <strong>
              100<span>%</span>
            </strong>
            <p>Delivered on time</p>
          </div>
          <div>
            <strong>
              04<span> sectors</span>
            </strong>
            <p>Business sectors</p>
          </div>
          <div>
            <strong>
              02<span> dashboards</span>
            </strong>
            <p>Content tools for clients</p>
          </div>
        </section>
      </Reveal>
      <section id="selected-work" className="work-section container">
        <Reveal>
          <SectionHeading
            number="01"
            label="SELECTED WORK"
            title="Built to do something."
          >
            <ActionLink href="/work">All projects</ActionLink>
          </SectionHeading>
          <p className="section-description">
            Three featured projects. Different problems.
            <br />
            Built to work well, with care in every detail.
          </p>
        </Reveal>
        <ProjectStack projects={projects.filter((project) => project.featured)} />
      </section>
      <ProjectGallery projects={projects} />
      <section className="about-preview">
        <StairBackdrop />
        <div className="container about-preview-inner">
          <span className="vertical-label">THE WAY I WORK</span>
          <Reveal>
            <p className="eyebrow">02 / A LITTLE ABOUT ME</p>
            <h2>
              Curious by nature.
              <br />
              <span>Careful with the details.</span>
            </h2>
          </Reveal>
          <Reveal className="about-preview-copy">
            <p>
              I’m an Informatics Engineering student at Universitas Pancasila
              and a freelance developer. I like turning complex problems into
              software that feels simple.
            </p>
            <p>
              I build websites, APIs, and AI tools. I care about the small
              details that help them work well.
            </p>
            <ActionLink href="/about">
              Meet the person behind the work
            </ActionLink>
          </Reveal>
        </div>
      </section>
      <section className="story-section container" aria-label="My approach">
        <p className="eyebrow">FROM IDEA TO EVERYDAY USE</p>
        <StoryGradient text="First, understand the problem. Then make it clear. Build with care. Keep making it better." />
      </section>
      <section className="practice-section container">
        <Reveal>
          <SectionHeading
            number="03"
            label="MY TOOLKIT"
            title="Tools I work with."
          />
        </Reveal>
        <div className="toolkit-row">
          <div>
            <span className="eyebrow">INTERFACE</span>
            <h3>React & Next.js</h3>
            <p>Websites that work on every screen.</p>
          </div>
          <div>
            <span className="eyebrow">SYSTEMS</span>
            <h3>Node.js & Laravel</h3>
            <p>APIs with clear rules and access.</p>
          </div>
          <div>
            <span className="eyebrow">DATA & INTELLIGENCE</span>
            <h3>PostgreSQL & AI</h3>
            <p>Data and AI that help people.</p>
          </div>
        </div>
        <Link href="/about#toolkit" className="text-link">
          Explore the full toolkit <ArrowUpRight size={15} />
        </Link>
      </section>
      <Reveal>
        <ContactBanner />
      </Reveal>
    </>
  );
}
