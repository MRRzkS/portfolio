import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { profile } from "@/lib/content";
import { GooeyLink } from "@/components/gooey-link";
export function Footer() {
  return (
    <footer className="site-footer container">
      <Link href="/" className="wordmark" aria-label="Home">
        rr<span>.</span>
      </Link>
      <p>
        Built with care.
        <br />
        <span>© 2026 Razak</span>
      </p>
      <div>
        <a href={profile.github} target="_blank" rel="noopener noreferrer">
          GitHub <ArrowUpRight size={14} />
        </a>
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn <ArrowUpRight size={14} />
        </a>
        <a href={profile.cv} target="_blank" rel="noopener noreferrer">
          Résumé <ArrowUpRight size={14} />
        </a>
      </div>
      <span className="footer-location">Depok, Indonesia · UTC+7</span>
    </footer>
  );
}
export function ContactBanner() {
  return (
    <section className="contact-banner container">
      <p className="eyebrow">AN OPEN CONVERSATION</p>
      <div>
        <h2>
          Something in mind?
          <br />
          <span>Let’s make it happen.</span>
        </h2>
        <GooeyLink href="/contact" label="Start a conversation" />
      </div>
      <p>Open to internships, entry-level roles, and team projects.</p>
    </section>
  );
}
