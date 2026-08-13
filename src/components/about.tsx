import Link from 'next/link';

const CONTACT_EMAIL = 'rienchy.razak@email.com';
const GITHUB_URL = 'https://github.com/MRRzkS';
const LINKEDIN_URL = 'https://linkedin.com/in/rienchy-razak';

interface AboutProps {
  projectCount: number;
}

export function About({ projectCount }: AboutProps) {
  const facts = [
    { value: String(projectCount), label: 'Projects, curated\nfrom fifteen' },
    { value: '2', label: 'Languages shipped\nserver side' },
    { value: '89.9%', label: 'Coverage on the\nmoney path' },
    { value: '0', label: 'Numbers on this site\nI cannot defend' },
  ];

  return (
    <section id="about">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">03 / About</span>
          <h2>A short version.</h2>
        </div>

        <div className="about-grid">
          <div>
            <p>
              I am in my fifth semester of Informatics Engineering at{' '}
              <strong>Universitas Pancasila</strong>, and currently in the backend track of{' '}
              <strong>Maxy Academy&rsquo;s Digital Career Bootcamp</strong>.
            </p>
            <p>
              The work I am proudest of is rarely the feature. It is the retry that does not
              double-charge, the permission that the API respects as strictly as the interface, the
              callback that arrives twice and changes nothing the second time.
            </p>
            <p>
              I write so the next person to read the code does not have to reconstruct my reasoning.
              Comments explain why, names explain what, and anything clever gets rewritten until it
              is plain.
            </p>
            <p>
              Looking for an internship where I can work on backend systems with people who will
              tell me when I am wrong.
            </p>
          </div>

          <div className="facts">
            {facts.map((fact) => (
              <div className="fact" key={fact.label}>
                <div className="v">{fact.value}</div>
                <div className="k">
                  {fact.label.split('\n').map((line, index) => (
                    <span key={index}>
                      {line}
                      <br />
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer id="contact">
      <div className="wrap">
        <div className="foot-cta">
          <h2>
            Let us build something
            <br />
            that does not break quietly.
          </h2>
          <p>Open to backend internship placements. The fastest way to reach me is email.</p>

          <div className="actions">
            <a className="btn btn-primary" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            <a className="btn btn-glass" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </div>

        <div className="foot-bar">
          <span>&copy; {new Date().getFullYear()} Muhammad Rienchy Razak Simatupang</span>
          <div className="foot-links">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <Link href="/cv.pdf">Curriculum Vitae</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
