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
      bounds = element.getBoundingClientRect();
      const width = Math.min(88, Math.max(26, bounds.width * 0.55));
      field!.style.width = `${width}px`;
      field!.style.left = `${bounds.left + (bounds.width - width) / 2}px`;
      field!.style.top = `${bounds.bottom - 21}px`;
      field!.style.color = getComputedStyle(element).color;
      field!.style.setProperty("--gooey-drift-x", "0px");
      field!.style.setProperty("--gooey-drift-y", "0px");
      field!.dataset.primary = String(element.classList.contains("primary"));
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
        if (!bounds) return;
        const horizontal = Math.max(-1, Math.min(1, (pointerX - bounds.left) / bounds.width * 2 - 1));
        const vertical = Math.max(-1, Math.min(1, (pointerY - bounds.top) / bounds.height * 2 - 1));
        field!.style.setProperty("--gooey-drift-x", `${horizontal * 16}px`);
        field!.style.setProperty("--gooey-drift-y", `${vertical * 3}px`);
      });
    }

    function enter(event: PointerEvent) {
      const element = control(event.target);
      if (element) show(element);
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
      show(element);
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
      <svg viewBox="0 0 100 32" preserveAspectRatio="none">
        <defs>
          <filter id={filterId} x="-30%" y="-60%" width="160%" height="220%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="soft" />
            <feColorMatrix in="soft" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -6" />
          </filter>
        </defs>
        <g filter={`url(#${filterId})`}>
          <rect className="button-gooey-core" x="22" y="13" width="56" height="6" rx="3" />
          <circle className="button-gooey-drop first" cx="50" cy="16" r="5" />
          <circle className="button-gooey-drop second" cx="50" cy="16" r="4" />
        </g>
      </svg>
    </div>
  );
}
