"use client";

import { useEffect, useId, useRef } from "react";
import { isViewTransitionActive } from "@/lib/site-readiness";

const controls = "button, [role='button'], a.action-link, a.circle-link, a.text-link, a.back-link, a.nav-contact, .desktop-nav a, .mobile-nav a, summary";

// One small shared surface keeps the effect light, including on new route content.
export function ButtonGooey() {
  const filterId = `button-gooey-${useId().replaceAll(":", "")}`;
  const surface = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = surface.current;
    if (!field) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active: HTMLElement | null = null;
    let bounds: DOMRect | null = null;
    let frame = 0;
    let releaseTimer = 0;
    let pointerX = 0;
    let pointerY = 0;
    let lastX = 0;
    let lastY = 0;

    function position(element: HTMLElement) {
      bounds = element.getBoundingClientRect();
      field!.style.width = `${bounds.width}px`;
      field!.style.height = `${bounds.height}px`;
      field!.style.left = `${bounds.left}px`;
      field!.style.top = `${bounds.top}px`;
      field!.style.borderRadius = getComputedStyle(element).borderRadius;
      field!.style.setProperty("--gooey-size", `${Math.min(30, Math.max(16, bounds.height * 0.55))}px`);
    }

    function point(x: number, y: number, stretch = 1, angle = 0) {
      field!.style.setProperty("--gooey-x", `${x}px`);
      field!.style.setProperty("--gooey-y", `${y}px`);
      field!.style.setProperty("--gooey-stretch", String(stretch));
      field!.style.setProperty("--gooey-angle", `${angle}rad`);
    }

    function control(target: EventTarget | null) {
      const element = target instanceof Element ? target.closest<HTMLElement>(controls) : null;
      return element && !element.matches(":disabled, [aria-disabled='true']") && !element.closest("[inert]") ? element : null;
    }

    function hide() {
      active = null;
      bounds = null;
      field!.dataset.active = "false";
      field!.dataset.pressed = "false";
      cancelAnimationFrame(frame);
      frame = 0;
      window.clearTimeout(releaseTimer);
    }

    function show(element: HTMLElement) {
      if (preference.matches || isViewTransitionActive()) return;
      if (active === element) return;
      window.clearTimeout(releaseTimer);
      active = element;
      position(element);
      field!.style.color = getComputedStyle(element).color;
      lastX = bounds!.width / 2;
      lastY = bounds!.height / 2;
      point(lastX, lastY);
      field!.dataset.active = "true";
      field!.dataset.pressed = "false";
    }

    function move(event: PointerEvent) {
      const element = control(event.target);
      if (!element) return;
      show(element);
      if (!active || !bounds) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!active) return;
        position(active);
        const x = Math.max(0, Math.min(bounds!.width, pointerX - bounds!.left));
        const y = Math.max(0, Math.min(bounds!.height, pointerY - bounds!.top));
        const dx = x - lastX;
        const dy = y - lastY;
        const stretch = 1 + Math.min(0.22, Math.hypot(dx, dy) / 180);
        point(x, y, stretch, Math.atan2(dy, dx));
        lastX = x;
        lastY = y;
      });
    }

    function enter(event: PointerEvent) {
      move(event);
    }
    function leave(event: PointerEvent) {
      if (active && control(event.relatedTarget) !== active) hide();
    }
    function focus(event: FocusEvent) {
      const element = control(event.target);
      if (element?.matches(":focus-visible")) show(element);
    }
    function blur(event: FocusEvent) {
      if (active && control(event.relatedTarget) !== active) hide();
    }
    function press(event: PointerEvent) {
      const element = control(event.target);
      if (!element) return;
      move(event);
      if (active) field!.dataset.pressed = "true";
    }
    function release(event: PointerEvent) {
      field!.dataset.pressed = "false";
      if (event.pointerType !== "mouse") releaseTimer = window.setTimeout(hide, 280);
    }
    function keyboard(event: KeyboardEvent) {
      if (event.key !== "Enter" && event.key !== " ") return;
      const element = control(event.target);
      if (element) show(element);
      if (active) field!.dataset.pressed = String(event.type === "keydown");
    }
    function click() {
      if (isViewTransitionActive() || (active instanceof HTMLAnchorElement && active.target !== "_blank")) {
        hide();
      } else if (active && !frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (active) field!.style.color = getComputedStyle(active).color;
        });
      }
    }

    document.addEventListener("pointerover", enter);
    document.addEventListener("pointerout", leave);
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", press);
    document.addEventListener("pointerup", release);
    document.addEventListener("pointercancel", hide);
    document.addEventListener("focusin", focus);
    document.addEventListener("focusout", blur);
    document.addEventListener("keydown", keyboard);
    document.addEventListener("keyup", keyboard);
    document.addEventListener("click", click);
    document.addEventListener("scroll", hide, { capture: true, passive: true });
    window.addEventListener("resize", hide);
    window.addEventListener("blur", hide);
    preference.addEventListener("change", hide);
    return () => {
      hide();
      document.removeEventListener("pointerover", enter);
      document.removeEventListener("pointerout", leave);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", press);
      document.removeEventListener("pointerup", release);
      document.removeEventListener("pointercancel", hide);
      document.removeEventListener("focusin", focus);
      document.removeEventListener("focusout", blur);
      document.removeEventListener("keydown", keyboard);
      document.removeEventListener("keyup", keyboard);
      document.removeEventListener("click", click);
      document.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
      window.removeEventListener("blur", hide);
      preference.removeEventListener("change", hide);
    };
  }, []);

  return (
    <div ref={surface} className="button-gooey" aria-hidden="true" data-active="false" data-pressed="false">
      <svg width="0" height="0" className="button-gooey-definitions">
        <defs>
          <filter id={filterId} x="-30%" y="-60%" width="160%" height="220%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="soft" />
            <feColorMatrix in="soft" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -6" />
          </filter>
        </defs>
      </svg>
      <span className="button-gooey-point" style={{ filter: `url(#${filterId})` }} />
    </div>
  );
}
