"use client";
import { useEffect, useRef } from "react";
import { timeline } from "@/lib/content";
import { gsap, ScrollTrigger } from "@/lib/animation";
export function Journey() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = section.current;
    const rail = track.current;
    if (!element || !rail) return;
    const media = gsap.matchMedia();
    media.add("(min-width: 900px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)", () => {
      element.classList.add("emaki-enabled");
      const cards = Array.from(rail.querySelectorAll<HTMLElement>(".journey-card"));
      let travel = Math.max(0, rail.scrollWidth - rail.clientWidth);
      const trigger = ScrollTrigger.create({
        trigger: element,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onRefresh: () => { travel = Math.max(0, rail.scrollWidth - rail.clientWidth); },
        onUpdate: ({ progress }) => {
          const turn = Math.sin(progress * Math.PI) * 3;
          rail.style.transform = `translate3d(${-travel * progress}px, 0, 0) rotateY(${turn}deg)`;
          cards.forEach((card, index) => {
            const distance = index - progress * (cards.length - 1);
            card.style.transform = `translateZ(${-Math.abs(distance) * 80}px) rotateY(${-distance * 9}deg)`;
          });
          element.style.setProperty("--journey-progress", String(progress));
        },
      });
      return () => {
        trigger.kill();
        element.classList.remove("emaki-enabled");
        rail.style.transform = "";
        cards.forEach((card) => { card.style.transform = ""; });
      };
    });
    return () => media.revert();
  }, []);
  return (
    <section
      className="journey"
      ref={section}
      aria-label="Experience and education timeline"
    >
      <div className="journey-sticky">
        <div className="container">
          <p className="eyebrow">02 / THE JOURNEY</p>
          <h2>
            Always a little
            <br />
            <span>further.</span>
          </h2>
          <p className="journey-hint">
            Scroll through the steps that brought me here.
          </p>
          <div className="journey-progress" aria-hidden="true"><span /></div>
          <div className="journey-window">
            <div className="journey-track" ref={track}>
              {timeline.map((item) => (
                <article key={item.label} className="journey-card">
                  <p className="eyebrow">{item.date}</p>
                  <h3>{item.title}</h3>
                  <span className="journey-role">{item.label}</span>
                  <p>{item.body}</p>
                  <div className="journey-metric">
                    <strong>{item.number}</strong>
                    <span>{item.metric}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
