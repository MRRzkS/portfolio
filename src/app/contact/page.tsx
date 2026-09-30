import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { profile } from "@/lib/content";
import { ContactForm } from "@/components/contact-form";
export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Razak for software engineering opportunities, internships, and project collaborations.",
};
// Static contact information with client-side validation and an explicit email-draft handoff.
export default function ContactPage() {
  return (
    <>
      <section className="page-intro container">
        <p className="eyebrow">03 / LET’S CONNECT</p>
        <h1>
          Good things start
          <br />
          <span>with a hello.</span>
        </h1>
      </section>
      <section className="container contact-layout">
        <div className="contact-information">
          <span className="availability">
            <span className="status-dot" /> Open to opportunities
          </span>
          <h2>
            Let’s build
            <br />
            something useful.
          </h2>
          <p>
            I’m looking for internships and entry-level software engineering
            roles. I’m also open to freelance projects and thoughtful
            collaborations.
          </p>
          <div className="contact-info-row">
            <span className="eyebrow">BASED IN</span>
            <p>
              Depok, West Java, Indonesia
              <br />
              <span>UTC+7 · Open to remote work</span>
            </p>
          </div>
          <div className="contact-info-row">
            <span className="eyebrow">FIND ME ELSEWHERE</span>
            <a href={profile.github} target="_blank" rel="noopener noreferrer">
              GitHub <ArrowUpRight size={16} />
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn <ArrowUpRight size={16} />
            </a>
            <a href={profile.cv} target="_blank" rel="noopener noreferrer">
              Download résumé <ArrowUpRight size={16} />
            </a>
          </div>
          <span className="vertical-label">LET’S MAKE A CONNECTION</span>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
