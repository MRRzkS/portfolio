import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="hero notfound">
      <div className="grain" />
      <div className="wrap">
        <div className="badge">404</div>
        <h1>This page is not published.</h1>
        <p className="lede">
          Either the address is wrong, or the project behind it is still a draft. The work that is
          ready is one link away.
        </p>
        <div className="actions">
          <Link className="btn btn-primary" href="/">
            Back to the work &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
