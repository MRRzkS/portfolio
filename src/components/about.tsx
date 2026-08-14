import Link from 'next/link';

const CONTACT_EMAIL = 'rienchy.razak@gmail.com';
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
              <strong>Universitas Pancasila</strong>, and I am currently on the backend track of{' '}
              <strong>Maxy Academy&rsquo;s Digital Career Bootcamp</strong>.
            </p>
            <p>
              Software engineering is what I want to do. I like the whole arc of it &mdash; turning a
              messy real problem into something that runs, then making it solid enough that other
              people can rely on it. The parts that pull me in most are the ones with real
              consequences: a payment that must not run twice, a request that reaches the right place
              and nowhere else, data that stays consistent when things happen at once. Getting those
              right is the craft I enjoy.
            </p>
            <p>
              I write code to be read. I explain why something is there, I name things for what they
              do, and if a piece is clever I rewrite it until it is just clear &mdash; because the next
              person on the project (often future me) should not have to reverse-engineer my intent.
            </p>
            <p>
              I am looking for a backend internship where I can build real systems alongside people
              who will point out what I got wrong, because that is how I get better fast.
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
            worth shipping.
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
