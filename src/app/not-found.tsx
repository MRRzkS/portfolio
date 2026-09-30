import Link from "next/link";
export default function NotFound() {
  return (
    <section className="container page-intro not-found">
      <p className="eyebrow">404 / A SMALL DETOUR</p>
      <h1>
        This path
        <br />
        <span>ends here.</span>
      </h1>
      <p>The page you’re looking for couldn’t be found.</p>
      <Link className="action-link primary" href="/">
        Back to home →
      </Link>
    </section>
  );
}
