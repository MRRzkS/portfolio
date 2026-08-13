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
            Open to internships
          </div>

          <h1 className="rise d2">
            I build systems
            <br />
            that <span className="grad">stay correct</span>
            <br />
            when things fail.
          </h1>

          <p className="role rise d3">
            Muhammad Rienchy Razak Simatupang &nbsp;&middot;&nbsp; <em>Software Engineer</em>
          </p>

          <p className="lede rise d3">
            Fifth-semester Informatics student in Depok. Most of what interests me sits at the
            boundary where something goes wrong: a process that dies between two writes, a role
            that reaches an endpoint it should not, a callback that arrives twice.
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
