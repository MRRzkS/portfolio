"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="container page-intro">
      <p className="eyebrow">SOMETHING WENT WRONG</p>
      <h1>
        A moment
        <br />
        <span>to regroup.</span>
      </h1>
      <p>The page couldn’t load. Please try again.</p>
      <button className="action-link primary" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
