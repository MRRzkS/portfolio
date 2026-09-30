import type { Metadata } from "next";
import Image from "next/image";
import { profile } from "@/lib/content";
import { ActionLink, SectionHeading } from "@/components/ui";
import { Reveal, Tilt } from "@/components/motion";
import { Journey } from "@/components/journey";
import { ContactBanner } from "@/components/footer";
export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Razak: Informatics Engineering student, freelance developer, and full-stack engineer based in Depok, Indonesia.",
};
const toolkit = [
  {
    label: "Languages",
    items: ["TypeScript", "JavaScript", "PHP", "SQL", "Python"],
  },
  {
    label: "Frontend",
    title: "React & Next.js",
    items: ["React", "Next.js", "Tailwind CSS", "HTML & CSS"],
  },
  {
    label: "Backend",
    title: "Node.js & Laravel",
    items: ["Node.js", "Express", "Laravel", "REST APIs", "BullMQ"],
  },
  { label: "Data", title: "PostgreSQL & MySQL", items: ["PostgreSQL", "MySQL", "Supabase", "Redis"] },
  {
    label: "Applied AI",
    title: "Useful AI tools",
    items: ["OpenRouter", "Google AI Studio", "AI API Integration"],
  },
  {
    label: "Engineering",
    title: "Build. Check. Ship.",
    items: ["Git & GitHub", "Postman", "Jest", "Vercel", "Neon"],
  },
];
const languageMarks: Record<string, string> = {
  TypeScript: "TS",
  JavaScript: "JS",
  PHP: "PHP",
  SQL: "SQL",
  Python: "PY",
};
// Biography is static; the timeline adds optional scroll motion in a client island.
export default function AboutPage() {
  return (
    <>
      <section className="page-intro container">
        <p className="eyebrow">02 / THE PERSON BEHIND THE CODE</p>
        <h1>
          A curious mind.
          <br />
          <span>A careful craft.</span>
        </h1>
      </section>
      <section className="container biography">
        <div className="bio-portrait">
          <Image
            src="/razak-no_bg.png"
            alt="Razak"
            width={1230}
            height={1278}
            priority
            sizes="(max-width: 700px) 85vw, 40vw"
          />
          <span className="vertical-label">DEPOK, INDONESIA</span>
        </div>
        <div className="bio-copy">
          <p className="eyebrow">HI, I’M RAZAK.</p>
          <h2>
            I like making
            <br />
            complex things
            <br />
            <span>feel simple.</span>
          </h2>
          <p>
            I’m Razak, a software engineer, full-stack developer, and
            Informatics Engineering student at Universitas Pancasila.
          </p>
          <p>
            Since September 2024, I’ve worked with real businesses to bring
            their websites to life. That experience taught me to listen closely,
            make clear decisions, and deliver what I promise.
          </p>
          <p>
            I enjoy building clear interfaces, reliable apps, and useful AI
            tools. I’m looking for an internship or entry-level role where I can
            contribute and keep learning.
          </p>
          <ActionLink href={profile.cv} primary external>
            Read my résumé
          </ActionLink>
        </div>
      </section>
      <Journey />
      <section className="container principles-section">
        <Reveal>
          <SectionHeading
            number="03"
            label="HOW I THINK"
            title="Care, in the details."
          />
        </Reveal>
        <div className="principles-grid">
          <article>
            <span className="principle-number">01</span>
            <h3>Understand first.</h3>
            <p>
              I take time to understand the problem and ask questions before
              writing code.
            </p>
          </article>
          <article>
            <span className="principle-number">02</span>
            <h3>Make it clear.</h3>
            <p>
              Clear code and simple interfaces help the next person understand
              the work.
            </p>
          </article>
          <article>
            <span className="principle-number">03</span>
            <h3>Follow through.</h3>
            <p>
              I check inputs, handle errors, and write clear notes before
              calling a project done.
            </p>
          </article>
        </div>
      </section>
      <section id="toolkit" className="container full-toolkit">
        <SectionHeading
          number="04"
          label="TOOLS I WORK WITH"
          title="My everyday tools."
        />
        <div className="toolkit-grid">
          {toolkit.map((group) => group.label === "Languages" ? (
            <div key={group.label} className="toolkit-language-group">
              <p className="eyebrow">Programming languages</p>
              <div className="programming-grid">
                {group.items.map((item) => (
                    <Tilt className="programming-language material-card" key={item}>
                      <strong aria-hidden="true">{languageMarks[item]}</strong>
                      <h3>{item}</h3>
                    </Tilt>
                ))}
              </div>
            </div>
          ) : (
            <Tilt key={group.label} className="tool-group material-card">
              <p className="eyebrow">{group.label}</p>
              <h3>{group.title}</h3>
              <div className="toolkit-tags">{group.items.map((item) => <span key={item}>{item}</span>)}</div>
            </Tilt>
          ))}
        </div>
      </section>
      <section
        className="container languages-section"
        aria-label="Spoken languages"
      >
        <Reveal>
          <SectionHeading number="05" label="LANGUAGES" title="Let's talk." />
          <p className="section-description">
            Two languages I use to connect, learn, and work.
          </p>
        </Reveal>
        <div className="language-grid">
          <Reveal>
          <Tilt className="language-card material-card">
            <span className="eyebrow">MY FIRST LANGUAGE</span>
            <span className="language-mark" aria-hidden="true">
              ID
            </span>
            <div className="language-card-bottom">
              <h3>Bahasa Indonesia</h3>
              <p>Native speaker</p>
            </div>
          </Tilt>
          </Reveal>
          <Reveal>
          <Tilt className="language-card language-card-dark material-card">
            <span className="eyebrow">FOR WORK AND LEARNING</span>
            <span className="language-mark" aria-hidden="true">
              EN
            </span>
            <div className="language-card-bottom">
              <h3>English</h3>
              <p>Professional working level</p>
            </div>
          </Tilt>
          </Reveal>
        </div>
      </section>
      <ContactBanner />
    </>
  );
}
