import type { Metadata } from "next";
import { ProjectExplorer } from "@/components/project-explorer";
import { ContactBanner } from "@/components/footer";
export const metadata: Metadata = {
  title: "Selected Work",
  description:
    "AI tools, business apps, MarkdownPad, and Fly High. Explore what I built and how it works.",
};
// Static page with a small client island for local category filtering.
export default function WorkPage() {
  return (
    <>
      <section className="page-intro container">
        <p className="eyebrow">01 / WORK & EXPLORATIONS</p>
        <h1>
          Ideas, made
          <br />
          <span>real.</span>
        </h1>
        <div className="intro-bottom">
          <p>
            Products, systems, and the experiments in between.
            <br />
            See what I built and how it works.
          </p>
          <span className="vertical-label">SELECTED WORK · 2026</span>
        </div>
      </section>
      <section
        className="container work-collection"
        aria-label="Project collection"
      >
        <ProjectExplorer />
      </section>
      <ContactBanner />
    </>
  );
}
