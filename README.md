# Razak · Kanso portfolio

A Next.js 16 and TypeScript portfolio based on the supplied CV and public GitHub project documentation. Home, Work, About, Contact, and five individual case studies.

## Run

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For production, run `npm run build` then `npm start`.

## Verify

```sh
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests start a production server on port 3100. They cover all nine pages, project filters, image loading, overflow, page transitions, the language showcase, form validation, email draft creation, reduced motion, and 404 behavior on desktop and mobile.

## Content

- `src/lib/content.ts`: profile, featured CV projects, and experience timeline.
- `src/lib/additional-projects.ts`: MarkdownPad and Fly High.
- `docs/content-sources.md`: evidence and interpretation of statistics.
- `public/`: supplied portrait, CV, screenshots, and captures of the two additional live projects.

Briefly AI, SkillSync, and Kyklos are featured on the home page and first in the Work collection. Each case study includes numbers, expandable feature details, repository links, and short usage notes. Public copy uses simple language without source annotations.

## Design

The supplied Kanso Pro Max system informs the warm light and charcoal surfaces, 96–128px desktop container padding, nonuniform bento collection, 24–28px card corners, monumental Geist titles, vertical serif labels, and matte glass navigation. Cards use subtle pointer tilt; reveals and the desktop horizontal experience timeline respect reduced motion. Mobile timelines render as regular stacked cards.

Page changes blend through the browser View Transition API, with regular navigation as a fallback. Large titles and sections use soft reveals. Reduced motion turns off these animations. About includes dedicated programming and spoken language showcases.

The refined layout uses larger body text, more space between sections, asymmetric language and toolkit cards, and subtle light that follows the pointer. Gold stays on primary actions. Contact guidance opens in a small glass panel. Parallel page transitions hold scrolling while both pages slide, and the incoming page starts at the top.

GSAP ScrollTrigger, SplitText, and ScrambleText, Lenis, Three.js, and custom WebGL shaders power the project stack, looping 3D gallery, fluid portrait backdrop, pixel masks, stair backgrounds, gooey contact control, text gradients, and parallel page transitions. See `docs/animation-system.md` for all twenty-one requested techniques and their accessibility fallbacks.

Geist is hosted locally through `next/font/local`. Its SIL Open Font License is preserved in `src/fonts/OFL.txt`. Icons use Lucide. Project screenshots are the owner's supplied images or captures of the owner's public applications; no generated artwork is used.

## Contact and deployment

Contact validates inline and opens a prefilled `mailto:` draft. It does not send or store messages. A direct email and copy button provide a fallback.

Set `SITE_URL` to the final origin before building a deployment, such as `https://your-domain.example`. This supplies the metadata base and enables the sitemap. Without it, local preview metadata uses localhost and the sitemap has no entries. No third-party API keys are needed. The site has not been published by this implementation.

All known portfolio routes are statically generated from reviewed content. Unknown project paths call `notFound()`; content is updated by editing the source data and rebuilding.
