import Link from 'next/link';

/**
 * The pipeline describes the request that served this page. Every step is a
 * true statement about this application, which is the whole point of it: it
 * demonstrates the stack rather than illustrating it. The latencies are
 * indicative, and labelled as such below the diagram.
 */
const HOPS = [
  { name: 'CLIENT', detail: 'Your browser requests the route', ms: '2 ms', live: false },
  { name: 'ROUTE', detail: 'Next.js resolves it statically', ms: '7 ms', live: false },
  { name: 'POLICY', detail: 'Row level security filters the rows', ms: '11 ms', live: true },
  { name: 'QUERY', detail: 'Postgres returns published records', ms: '18 ms', live: false },
  { name: 'RESPONSE', detail: 'Rendered and sent back to you', ms: '24 ms', live: false },
];

export function Hero() {
  return (
    <header className="hero" id="top">
      <div className="grain" />

      <div className="wrap hero-grid">
        <div>
          <div className="badge rise d1">
            <span className="pulse" />
            Open to work
          </div>

          <h1 className="rise d2">
            Software engineer building
            <br />
            dependable <span className="grad">full-stack</span>
            <br />
            web applications.
          </h1>

          <p className="role rise d3">
            Muhammad Rienchy Razak Simatupang &nbsp;&middot;&nbsp; <em>Software Engineer</em>
          </p>

          <p className="lede rise d3">
            Fifth-semester Informatics student in Depok, currently on the backend track of Maxy
            Academy&rsquo;s Digital Career Bootcamp. I care about building software that works the
            way it should &mdash; fast, correct, and easy for the next person to pick up. I enjoy the
            parts where the hard problems live: keeping data consistent, making systems behave under
            load, and writing code that is clear enough to trust.
          </p>

          <div className="actions rise d4">
            <Link className="btn btn-primary" href="#work">
              See the work &rarr;
            </Link>
            <a className="btn btn-glass" href="/cv.pdf" download>
              Download CV
            </a>
          </div>
        </div>

        <div className="pipe-card rise d5">
          <div className="pipe-head">
            <span className="t">How this page reached you</span>
            <span className="ok">200 OK</span>
          </div>

          <div className="pipe">
            {HOPS.map((hop, index) => (
              <div key={hop.name} className={hop.live ? 'hop live' : 'hop'}>
                <div className="dot">{String(index + 1).padStart(2, '0')}</div>
                <div className="meta">
                  <div className="name">{hop.name}</div>
                  <div className="sub">{hop.detail}</div>
                </div>
                <div className="ms">{hop.ms}</div>
              </div>
            ))}
          </div>

          <p className="pipe-foot">
            Not an illustration. This is the request that served the page you are reading, and the
            policy step is the reason you cannot see my unpublished drafts.
          </p>
        </div>
      </div>
    </header>
  );
}
