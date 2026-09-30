"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { waitForPreparations, isSiteLoading } from "@/lib/site-readiness";
import { pausePageScroll, resumePageScroll } from "@/lib/page-scroll";

function decodeImage(source: string) {
  const image = new Image();
  image.src = source;
  return image.decode();
}

export function SiteLoader({ images, routes }: { images: string[]; routes: string[] }) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!isSiteLoading()) return;
    let disposed = false;
    let finishing = false;
    let exitTimer: ReturnType<typeof setTimeout>;
    const started = performance.now();
    const root = document.documentElement;
    const shell = document.getElementById("site-shell");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (shell) { shell.inert = true; shell.setAttribute("aria-busy", "true"); }
    pausePageScroll();

    function unlock() {
      if (shell) { shell.inert = false; shell.removeAttribute("aria-busy"); }
      resumePageScroll();
    }
    function finish() {
      if (disposed || finishing) return;
      finishing = true;
      setProgress(100);
      exitTimer = setTimeout(() => {
        setLeaving(true);
        root.dataset.boot = "revealing";
        document.dispatchEvent(new Event("site-ready"));
        exitTimer = setTimeout(() => {
          root.dataset.boot = "ready";
          unlock();
        }, reduced ? 0 : 920);
      }, reduced ? 0 : 260);
    }
    function safetyRelease() {
      // The parser-level timeout also releases the site if hydration never finishes.
      if (root.dataset.boot !== "ready" || finishing) return;
      finishing = true;
      setLeaving(true);
      unlock();
    }
    document.addEventListener("site-ready", safetyRelease);
    const deadline = setTimeout(finish, 6500);
    const sources = [...new Set([
      ...images,
      ...Array.from(document.images, (image) => image.currentSrc || image.src),
    ])];
    const jobs = [
      document.fonts.ready,
      ...(reduced ? [] : [import("./gallery-renderer"), import("./fluid-renderer")]),
      ...sources.map(decodeImage),
    ];
    let settled = 0;
    void Promise.allSettled(jobs.map((job) => job.finally(() => {
      settled += 1;
      if (!disposed && !finishing) setProgress(Math.round(settled / jobs.length * 90));
    }))).then(async () => {
      await waitForPreparations();
      if (disposed || finishing) return;
      for (const route of routes) router.prefetch(route);
      const delay = reduced ? 0 : Math.max(0, 550 - (performance.now() - started));
      exitTimer = setTimeout(finish, delay);
    });
    return () => {
      disposed = true;
      clearTimeout(deadline);
      clearTimeout(exitTimer);
      document.removeEventListener("site-ready", safetyRelease);
      unlock();
    };
  }, [images, routes, router]);

  return (
    <div className="site-loader" data-state={leaving ? "leaving" : "loading"}>
      <div className="loader-surfaces" aria-hidden="true">{[0, 1, 2].map((index) => <span key={index} style={{ "--panel": index } as React.CSSProperties} />)}</div>
      <div className="loader-content">
        <p className="eyebrow">PORTFOLIO / RAZAK</p>
        <p className="loader-name" aria-hidden="true">Razak<span>.</span></p>
        <div className="loader-meter" role="progressbar" aria-label="Preparing portfolio" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="loader-track" aria-hidden="true">
            <span className="loader-fill" style={{ transform: `scaleX(${progress / 100})` }} />
            {[18, 42, 65, 84].map((position) => <i key={position} style={{ left: `${position}%` }} />)}
          </div>
          <div className="loader-status" aria-hidden="true"><span>{progress === 100 ? "Ready." : "Getting ready."}</span><span>{String(progress).padStart(2, "0")}<small> / 100</small></span></div>
        </div>
        <p className="loader-note">Clear code. Real results.</p>
      </div>
      <span className="loader-side" aria-hidden="true">A MOMENT OF SPACE</span>
    </div>
  );
}
