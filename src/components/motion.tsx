"use client";
import { useEffect, useRef, type ReactNode, type PointerEvent } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/animation";
import { waitForPageReady } from "@/lib/site-readiness";
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const media = gsap.matchMedia();
    let disposed = false;
    void waitForPageReady().then(() => {
      if (disposed) return;
    media.add("(prefers-reduced-motion: no-preference)", () => {
      element.classList.add("reveal-ready");
      const trigger = ScrollTrigger.create({
        trigger: element,
        start: "top 95%",
        once: true,
        onEnter: () => element.classList.add("revealed"),
      });
      return () => {
        trigger.kill();
        element.classList.remove("reveal-ready", "revealed");
      };
    });
    });
    return () => { disposed = true; media.revert(); };
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
export function Tilt({
  children,
  className = "",
  enabled = true,
}: {
  children: ReactNode;
  className?: string;
  enabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const pointer = useRef<[number, number]>([0, 0]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  function move(event: PointerEvent<HTMLDivElement>) {
    if (
      !enabled ||
      event.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    pointer.current = [event.clientX, event.clientY];
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const element = ref.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const horizontal = (pointer.current[0] - rect.left) / rect.width - 0.5;
      const vertical = (pointer.current[1] - rect.top) / rect.height - 0.5;
      element.style.transform = `perspective(1200px) rotateX(${-vertical * 2}deg) rotateY(${horizontal * 2}deg)`;
      element.style.setProperty("--light-x", `${(horizontal + 0.5) * 100}%`);
      element.style.setProperty("--light-y", `${(vertical + 0.5) * 100}%`);
    });
  }
  return (
    <div
      ref={ref}
      className={`tilt ${className}`}
      onPointerMove={move}
      onPointerLeave={() => {
        cancelAnimationFrame(frame.current);
        frame.current = 0;
        if (ref.current) ref.current.style.transform = "";
      }}
    >
      {children}
    </div>
  );
}
export function RouteFocus() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  useEffect(() => {
    if (previousPath.current !== pathname) {
      document.getElementById("main-content")?.focus({ preventScroll: true });
      previousPath.current = pathname;
    }
  }, [pathname]);
  return null;
}
