"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/content";
import type { GalleryMotion } from "@/components/gallery-renderer";
import { gsap, ScrollTrigger, wrap } from "@/lib/animation";
import { isSiteLoading, registerPreparation, waitForPageReady } from "@/lib/site-readiness";

export function ProjectGallery({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const motion = useRef<GalleryMotion>({ target: 0, current: 0, visible: false });
  const drag = useRef<number | null>(null);
  const dragWidth = useRef(1);
  const scrollTarget = useRef(0);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const section = root.current;
    const host = canvasHost.current;
    if (!section || !host) return;
    let disposed = false;
    let disposeRenderer: (() => void) | undefined;
    let loading = false;
    let loadVersion = 0;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    async function loadRenderer() {
      if (loading || preference.matches || disposed) return;
      loading = true;
      const currentLoad = ++loadVersion;
      try {
        const { createGalleryRenderer } = await import("./gallery-renderer");
        if (disposed || preference.matches || currentLoad !== loadVersion) return;
        await new Promise<void>((resolve) => {
          disposeRenderer = createGalleryRenderer(host!, projects.map((project) => project.image!), motion.current,
            () => { if (!disposed) setReady(true); resolve(); },
            (next) => { if (!disposed) setIndex(next); },
            () => { if (!disposed) setReady(false); resolve(); },
          );
        });
      } catch {
        // The regular image and controls remain usable when WebGL is unavailable.
        if (!disposed && currentLoad === loadVersion) setReady(false);
      }
    }
    const visibility = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onToggle: ({ isActive }) => {
        motion.current.visible = isActive;
        if (isActive) motion.current.requestRender?.();
        if (isActive) void loadRenderer();
      },
    });
    motion.current.visible = visibility.isActive;
    if (isSiteLoading()) registerPreparation("gallery", loadRenderer());
    else void waitForPageReady().then(() => { if (!disposed) void loadRenderer(); });
    const media = gsap.matchMedia();
    media.add("(min-width: 900px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)", () => {
      section.classList.add("gallery-scroll");
      let previous = 0;
      const settle = gsap.delayedCall(0.18, () => {
        if (drag.current !== null) return;
        motion.current.target = Math.round(scrollTarget.current);
        motion.current.requestRender?.();
      }).pause();
      const tracking = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        onUpdate: ({ progress }) => {
          scrollTarget.current += (progress - previous) * (projects.length - 1);
          motion.current.target = scrollTarget.current;
          motion.current.requestRender?.();
          settle.restart(true);
          previous = progress;
        },
      });
      return () => { settle.kill(); tracking.kill(); section.classList.remove("gallery-scroll"); };
    });
    function changePreference() {
      if (preference.matches) {
        loadVersion += 1;
        disposeRenderer?.();
        disposeRenderer = undefined;
        loading = false;
        setReady(false);
      } else if (motion.current.visible) void loadRenderer();
    }
    preference.addEventListener("change", changePreference);
    return () => {
      disposed = true;
      visibility.kill();
      media.revert();
      preference.removeEventListener("change", changePreference);
      disposeRenderer?.();
    };
  }, [projects]);

  function select(target: number) {
    scrollTarget.current = target;
    motion.current.target = target;
    motion.current.requestRender?.();
    if (!ready) setIndex(wrap(Math.round(target), projects.length));
  }
  const project = projects[index];
  return (
    <section className="gallery-section" ref={root} aria-label="Project gallery">
      <div className="gallery-sticky">
        <div className="container gallery-heading">
          <div>
            <p className="eyebrow">A CLOSER LOOK</p>
            <h2>Ideas, in motion.</h2>
          </div>
          <p className="section-description">A few things I built. <br />Drag to take a closer look.</p>
        </div>
        <div className="container gallery-display">
          <div className={`gallery-stage ${ready ? "gallery-ready" : ""}`}
            onPointerDown={(event) => {
              if (!event.isPrimary || event.button !== 0) return;
              dragWidth.current = Math.max(1, event.currentTarget.clientWidth);
              drag.current = event.clientX;
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (drag.current === null) return;
              const distance = event.clientX - drag.current;
              drag.current = event.clientX;
              motion.current.target -= distance / dragWidth.current * 2.2;
              scrollTarget.current = motion.current.target;
              motion.current.requestRender?.();
            }}
            onPointerUp={(event) => {
              if (drag.current !== null) {
                select(Math.round(motion.current.target));
                drag.current = null;
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
            }}
            onPointerCancel={() => {
              if (drag.current !== null) select(Math.round(motion.current.target));
              drag.current = null;
            }}
            onLostPointerCapture={() => { drag.current = null; }}
          >
            <div className="gallery-canvas" ref={canvasHost} />
            <div className="gallery-fallback">
              <Image src={project.image!} alt={`${project.name} interface`} width={1440} height={800} sizes="(max-width: 700px) 90vw, 70vw" draggable={false} />
            </div>
          </div>
        </div>
        <div className="container gallery-bottom">
          <div className="gallery-current" aria-live="polite" aria-atomic="true">
            <p className="eyebrow"><span className="gallery-number">{String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>{project.category}</p>
            <Link href={`/work/${project.slug}`}>{project.name}<ArrowUpRight size={24} /></Link>
            <p className="gallery-summary">{project.summary}</p>
          </div>
          <div className="gallery-controls" role="group" aria-label="Gallery controls">
            <button aria-label="Previous project" onClick={() => select(Math.round(motion.current.target) - 1)}><ArrowLeft size={20} /></button>
            <div className="gallery-dots">
              {projects.map((item, position) => (
                <button key={item.slug} aria-label={`Show ${item.name}`} aria-pressed={index === position}
                  onClick={() => {
                    const current = Math.round(motion.current.target);
                    const distance = wrap(position - wrap(current, projects.length) + projects.length / 2, projects.length) - projects.length / 2;
                    select(current + distance);
                  }} />
              ))}
            </div>
            <button aria-label="Next project" onClick={() => select(Math.round(motion.current.target) + 1)}><ArrowRight size={20} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
