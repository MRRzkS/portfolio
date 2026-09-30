"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger, SplitText } from "@/lib/animation";
import { pausePageScroll, resetPageScroll, resumePageScroll } from "@/lib/page-scroll";
import { finishThemeTransition } from "@/lib/theme-transition";
import { waitForPageReady } from "@/lib/site-readiness";

// Keep Next.js routing and prefetching, and let the browser blend the two page views.
export function PageTransitions() {
  const pathname = usePathname();
  const router = useRouter();
  const finishNavigation = useRef<(() => void) | null>(null);
  const active = useRef<ViewTransition | null>(null);

  useLayoutEffect(() => {
    const complete = finishNavigation.current;
    if (!complete) return;
    resetPageScroll();
    const images = Array.from(document.getElementById("main-content")?.querySelectorAll("img") ?? [])
      .filter((image) => {
        const bounds = image.getBoundingClientRect();
        return bounds.top < window.innerHeight && bounds.bottom > 0;
      });
    // Capture the incoming view with its font and visible images already decoded.
    void Promise.allSettled([document.fonts.ready, ...images.map((image) => image.decode())]).then(() => {
      if (finishNavigation.current !== complete) return;
      resetPageScroll();
      finishNavigation.current = null;
      complete();
    });
  }, [pathname]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const content = document.getElementById("main-content");
    function navigate(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const target = event.target;
      const link =
        target instanceof Element
          ? target.closest<HTMLAnchorElement>("a[href]")
          : null;
      if (
        !link ||
        link.target ||
        link.hasAttribute("download") ||
        link.href.startsWith("mailto:")
      )
        return;
      const destination = new URL(link.href);
      if (
        destination.origin !== window.location.origin ||
        destination.pathname === window.location.pathname
      )
        return;
      if (
        !document.startViewTransition ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;

      event.preventDefault();
      finishThemeTransition();
      active.current?.skipTransition();
      finishNavigation.current?.();
      clearTimeout(timeout);
      pausePageScroll();
      const order = ["/", "/work", "/about", "/contact"];
      const parentPath = (path: string) => path === "/" ? "/" : `/${path.split("/")[1]}`;
      document.documentElement.dataset.pageDirection =
        order.indexOf(parentPath(destination.pathname)) < order.indexOf(parentPath(window.location.pathname)) ? "backward" : "forward";
      document.documentElement.classList.add("route-transitioning");
      // Snapshot positions differ from live DOM positions while the pages slide.
      // Keep the fixed navigation usable and prevent clicks on moving page content.
      if (content) {
        content.inert = true;
        content.setAttribute("aria-busy", "true");
      }
      const transition = document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            finishNavigation.current = resolve;
            // Release the visual hold if a route takes longer than expected.
            timeout = setTimeout(() => { finishNavigation.current = null; resetPageScroll(); resolve(); }, 2500);
            router.push(
              destination.pathname + destination.search + destination.hash,
              { scroll: false },
            );
          }),
      );
      active.current = transition;
      transition.finished
        .catch(() => undefined)
        .finally(() => {
          if (active.current !== transition) return;
          clearTimeout(timeout);
          active.current = null;
          document.documentElement.classList.remove("route-transitioning");
          document.dispatchEvent(new Event("route-ready"));
          resumePageScroll(destination.hash);
          if (content) {
            content.inert = false;
            content.removeAttribute("aria-busy");
            content.focus({ preventScroll: true });
          }
        });
    }
    document.addEventListener("click", navigate, true);
    return () => {
      document.removeEventListener("click", navigate, true);
      clearTimeout(timeout);
      finishNavigation.current?.();
      active.current?.skipTransition();
      document.documentElement.classList.remove("route-transitioning");
      document.dispatchEvent(new Event("route-ready"));
      resumePageScroll();
      if (content) {
        content.inert = false;
        content.removeAttribute("aria-busy");
      }
    };
  }, [router]);
  return null;
}

export function PageMotion({ children }: { children: ReactNode }) {
  const scene = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (document.documentElement.classList.contains("route-transitioning")) {
      scene.current?.classList.add("native-entry");
    }
  }, []);
  useEffect(() => {
    const element = scene.current;
    if (!element) return;
    const media = gsap.matchMedia();
    let disposed = false;
    // Wait for the real font before measuring and splitting text.
    Promise.all([document.fonts.ready, waitForPageReady()]).then(() => {
      if (disposed) return;
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const sections = Array.from(element.querySelectorAll<HTMLElement>(
          ":scope > section, :scope > .case-image",
        )).filter((section) => !section.matches(
          ".hero, .page-intro, .case-intro, .journey, .gallery-section, .work-section, .about-preview, .story-section",
        ));
        const triggers = sections.map((section) => {
          section.classList.add("section-motion");
          return ScrollTrigger.create({
            trigger: section,
            start: "top 95%",
            once: true,
            onEnter: () => section.classList.add("section-visible"),
          });
        });
        const splits: SplitText[] = [];
        const headings = element.querySelectorAll<HTMLElement>("h1, h2");
        for (const heading of headings) {
          if (element.classList.contains("native-entry") && heading.getBoundingClientRect().top < window.innerHeight) continue;
          const readableText = heading.innerText.replace(/\s+/g, " ").trim();
          splits.push(SplitText.create(heading, {
            type: "words",
            mask: "words",
            aria: "auto",
            wordsClass: "split-word",
            onSplit: (split) => gsap.from(split.words, {
              yPercent: 110,
              rotationX: -12,
              opacity: 0,
              duration: heading.matches("h1") ? 1.5 : 1.1,
              stagger: 0.055,
              ease: "power4.out",
              scrollTrigger: { trigger: heading, start: "top 94%", once: true },
            }),
          }));
          // SplitText uses textContent, which joins words separated by <br>.
          heading.setAttribute("aria-label", readableText);
        }
        const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());
        return () => {
          cancelAnimationFrame(refresh);
          triggers.forEach((trigger) => trigger.kill());
          splits.forEach((split) => split.revert());
          sections.forEach((section) => section.classList.remove("section-motion", "section-visible"));
        };
      });
    });
    return () => {
      disposed = true;
      media.revert();
    };
  }, []);
  return (
    <div ref={scene} className="page-scene">
      {children}
    </div>
  );
}
