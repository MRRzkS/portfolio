# Portfolio motion

All twenty-one requested techniques are part of the site. Real screenshots supply the gallery textures.

| Technique | Implementation |
| --- | --- |
| Scroll tracking | GSAP ScrollTrigger drives the stack, gallery, and timeline. |
| Smooth scrolling | Lenis is connected to the GSAP ticker. Touch scrolling stays native. |
| Viewport detection | ScrollTrigger reveals sections and loads the gallery near the viewport. |
| Sticky position | Featured project cards, the gallery stage, and the timeline use CSS sticky. |
| Easing | Slow power4 text reveals, smooth gallery movement, fast arrow states, and a slight button bounce. |
| Text splitting | GSAP SplitText splits words after fonts load, masks each word, preserves screen reader labels, and reverts on cleanup. Words wrap naturally when the screen changes size. |
| Mapping | Project and timeline arrays map into cards and controls. Scroll progress maps into position and depth. |
| Lerp | Frame-rate independent interpolation eases gallery movement and supplies velocity to the shader. |
| Shaders | Three.js ShaderMaterial uses a subdivided plane vertex shader for bending, plus a fragment shader for image crop, rounded masking, and edge shade. |
| Masks | SplitText word masks, page clip paths, section overflow, and rounded fragment masks use different timings. |
| Stacked cards | Featured cards stick and recede on roomy desktop screens. Short and narrow screens use regular cards. |
| Infinite 3D gallery | Perspective-camera image planes wrap around continuously. Scroll, horizontal drag, arrow buttons, and project buttons share one position. |
| 3D timeline | Scrolling moves the experience rail through perspective, turning each story card and changing its depth. |
| Parallel page transition | Native view transitions slide two viewport snapshots together with a soft start and end. The outgoing view keeps its visible position; Lenis pauses and the incoming page resets to the top before capture. Direction follows route order. The scrollbar hides while its gutter stays reserved. Content waits for snapshots to settle, while fixed navigation stays usable. A second navigation skips the first safely. Explicit anchor links scroll to their target after arrival. |
| Interactive gradients | A custom fragment shader changes the matte portrait gradient with pointer position, theme, and scroll progress. |
| Pixel transition | Project images open through a 12 by 6 mask. GSAP staggers alternating rows around a center seam, with inward or outward direction per project. |
| Stair transition | Six charcoal background strips open from the bottom with staggered scale and opacity behind the About preview. |
| Fluid shader | Two low-resolution textures exchange advected dye. Cursor velocity adds flow and splats behind the portrait, with no overlay on text. |
| Text scramble | GSAP ScrambleText resolves small section labels using a restrained numeric character set. Screen readers receive the stable original text. |
| WebGL image gallery | The existing gallery uses perspective planes, repeated wrapping, velocity-based vertex distortion, and scroll-controlled positions. |
| Gooey touch effect | The contact arrow uses two small circles with SVG blur and a color matrix. Pointer, touch, and keyboard focus move the circles; the link keeps its usual hit area. |
| Text gradient | A short statement brightens word by word through scroll-driven opacity and text gradient changes. A separate plain copy remains available to screen readers. |

## Accessibility and performance

Theme changes use a circular viewport reveal centered on the theme button. Both light and dark modes expand over the previous view in 760ms. The navigation is included in this snapshot. A new page transition clears the theme reveal first; reduced motion and browsers without View Transition support switch colors immediately.

- Reduced motion turns off Lenis, splitting, sticky scroll scenes, and WebGL. Regular images and gallery controls remain available.
- The canvas is hidden from screen readers. The current project name, link, and labeled buttons remain normal HTML.
- WebGL uses separate chunks prepared by the opening loader. On the home page, gallery texture uploads and shader compilation complete before the opening reveal. Frame scheduling stops when movement settles, outside its viewport, and in background tabs. Pointer, scroll, resize, and visibility changes wake the renderers. Pixel ratio is capped at 1.5.
- Pointer effects measure and update at most once per animation frame. The timeline measures its travel on refresh. Large section reveals use opacity and transforms without full-section blur.
- Gallery loading ignores stale imports when motion preferences change, and only the current renderer can update its controls.
- Texture, geometry, material, listener, trigger, and renderer resources are released when leaving the page.
- WebGL initialization, shader failure, and context loss retain the image fallback.
- Browser verification uses Chromium software WebGL because the test environment has no attached desktop GPU.

## Opening preparation

`SiteLoader` shows measured asset completion on a segmented line. It decodes project textures and page images, waits for local fonts, loads animation chunks, and waits for registered scene preparation. Next.js route prefetches run in the background. Title motion starts when the opening panels lift. Scrolling and focus remain held until the reveal finishes; regular page changes do not replay the loader.

Reduced motion removes the panel animation and avoids loading unused shader chunks. Failed assets and WebGL setup retain image fallbacks. A 6.5-second preparation deadline releases stalled work, with a separate parser-level safety release after 8 seconds if hydration fails. Without JavaScript, the server-rendered page stays visible.

Main files: `src/lib/animation.ts`, `src/components/smooth-scroll.tsx`, `page-motion.tsx`, `project-stack.tsx`, `project-gallery.tsx`, `gallery-renderer.ts`, `journey.tsx`, `fluid-backdrop.tsx`, `fluid-renderer.ts`, `pixel-reveal.tsx`, `stair-backdrop.tsx`, `scramble-label.tsx`, `gooey-link.tsx`, `story-gradient.tsx`, and `src/app/motion.css`.
