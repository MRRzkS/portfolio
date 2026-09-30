import { test, expect } from "@playwright/test";

const routes = [
  "/",
  "/work",
  "/about",
  "/contact",
  "/work/briefly-ai",
  "/work/skillsync",
  "/work/kyklos",
  "/work/markdownpad",
  "/work/fly-high",
];

for (const route of routes) {
test(`${route} renders without browser errors, missing images, or horizontal overflow`, async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    const copy = await page.locator("body").innerText();
    expect(copy, route).not.toMatch(/\u2014|Rienchy|Source:|Sources:|EVIDENCE|README|sourced from/);
    await page.locator("footer").scrollIntoViewIfNeeded();
    await page.evaluate(async () => {
      await Promise.all(
        Array.from(document.images).map((image) =>
          image.decode().catch(() => undefined),
        ),
      );
    });
    expect(
      await page.evaluate(() =>
        Array.from(document.images)
          .filter((image) => !image.naturalWidth)
          .map((image) => image.src),
      ),
      route,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
      route,
    ).toBe(true);
  expect(errors).toEqual([]);
});
}

test("About gives spoken and programming languages their own showcase", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator(".toolkit-grid").getByText("TypeScript", { exact: true })).toBeAttached();
  const languages = page.getByRole("region", { name: "Spoken languages" });
  await languages.scrollIntoViewIfNeeded();
  await expect(languages.locator(".language-card")).toHaveCount(2);
  await expect(languages.getByRole("heading", { name: "Bahasa Indonesia" })).toBeVisible();
  await expect(languages.getByText("Native speaker")).toBeVisible();
  await expect(languages.getByRole("heading", { name: "English", exact: true })).toBeVisible();
  await expect(languages.getByText("Professional working level")).toBeVisible();
});

test("the project gallery loops and supports keyboard controls", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  const gallery = page.getByRole("region", { name: "Project gallery" });
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery.locator(".gallery-stage")).toHaveClass(/gallery-ready/);
  await expect(page.locator("h1")).toHaveAttribute("aria-label", "Clear code. Real results.");
  await gallery.getByRole("button", { name: "Show Briefly AI", exact: true }).click();
  await expect(gallery.getByRole("link", { name: "Briefly AI", exact: true })).toBeVisible();
  const previous = gallery.getByRole("button", { name: "Previous project" });
  await previous.focus();
  await page.keyboard.press("Enter");
  await expect(gallery.getByRole("link", { name: "Fly High", exact: true })).toBeVisible();
  await gallery.getByRole("button", { name: "Next project" }).click();
  await expect(gallery.getByRole("link", { name: "Briefly AI", exact: true })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(gallery.locator("canvas")).toHaveCount(0);
  await expect(page.locator(".split-word")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("the gallery recovers from repeated motion changes without duplicate canvases", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const gallery = page.getByRole("region", { name: "Project gallery" });
  await gallery.scrollIntoViewIfNeeded();
  for (let change = 0; change < 3; change += 1) {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.emulateMedia({ reducedMotion: "no-preference" });
  }
  await expect(gallery.locator(".gallery-stage")).toHaveClass(/gallery-ready/);
  await expect(gallery.locator("canvas")).toHaveCount(1);
  await gallery.getByRole("button", { name: "Show Fly High" }).click();
  await expect(gallery.getByRole("link", { name: "Fly High", exact: true })).toBeVisible();
  await gallery.getByRole("link", { name: "Fly High", exact: true }).click();
  await expect(page).toHaveURL(/\/work\/fly-high$/);
  await expect(page.locator("canvas")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("WebGL pauses off screen and wakes when the gallery returns", async ({ page }) => {
  await page.addInitScript(() => {
    for (const prototype of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
      const draw = prototype.drawArrays;
      prototype.drawArrays = function(...args) {
        const root = document.documentElement;
        root.dataset.draws = String(Number(root.dataset.draws || 0) + 1);
        return Reflect.apply(draw, this, args);
      };
    }
  });
  await page.goto("/");
  const gallery = page.getByRole("region", { name: "Project gallery" });
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery.locator(".gallery-stage")).toHaveClass(/gallery-ready/);
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const draws = await page.locator("html").getAttribute("data-draws");
  await page.waitForTimeout(400);
  expect(await page.locator("html").getAttribute("data-draws")).toBe(draws);
  await gallery.scrollIntoViewIfNeeded();
  await gallery.getByRole("button", { name: "Show MarkdownPad" }).click();
  await expect(gallery.getByRole("link", { name: "MarkdownPad", exact: true })).toBeVisible();
});

test("reduced motion keeps gallery controls and complete heading text", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Clear");
  await expect(page.locator("h1")).toContainText("results.");
  const gallery = page.getByRole("region", { name: "Project gallery" });
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery.locator("canvas")).toHaveCount(0);
  await gallery.getByRole("button", { name: "Show MarkdownPad" }).click();
  await expect(gallery.getByRole("link", { name: "MarkdownPad", exact: true })).toBeVisible();
  await expect(gallery.locator(".gallery-fallback img")).toBeVisible();
});

test("parallel transitions hide the scrollbar and recover from a second navigation", async ({ page, isMobile }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explore my work", exact: true }).click();
  await expect(page).toHaveURL(/\/work$/);
  await expect(page.locator("html")).toHaveCSS("overflow-y", "hidden");
  await expect(page.locator("main")).toHaveAttribute("inert", "");
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter((animation) =>
    "animationName" in animation && String(animation.animationName).startsWith("parallel-")
  ).length)).toBe(2);
  if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
  const navigation = page.getByRole("navigation", { name: isMobile ? "Mobile navigation" : "Main navigation" });
  await navigation.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect.poll(() => page.locator("html").getAttribute("class")).not.toMatch(/route-transitioning/);
  await expect(page.locator("html")).not.toHaveCSS("overflow-y", "hidden");
  await expect(page.locator("main")).not.toHaveAttribute("inert", "");
});

test("a page opened from a scrolled view arrives at the top without scroll momentum", async ({ page, isMobile }) => {
  await page.goto("/about");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(700);
  if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
  const navigation = page.getByRole("navigation", { name: isMobile ? "Mobile navigation" : "Main navigation" });
  await navigation.getByRole("link", { name: "Work", exact: true }).click();
  await expect(page).toHaveURL(/\/work$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.locator("html").getAttribute("class")).not.toMatch(/route-transitioning/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator("h1")).toBeVisible();
});

test("the fluid surface responds to a pointer and turns off for reduced motion", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  const surface = page.locator(".fluid-backdrop");
  await expect(surface).toHaveClass(/fluid-ready/);
  const canvas = surface.locator("canvas");
  const before = await canvas.screenshot({ animations: "disabled" });
  const bounds = (await page.locator(".hero").boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width * 0.8, bounds.y + bounds.height * 0.3);
  await page.waitForTimeout(300);
  const after = await canvas.screenshot({ animations: "disabled" });
  expect(after.equals(before)).toBe(false);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(surface).not.toHaveClass(/fluid-ready/);
  await expect(surface).toBeHidden();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(surface).toHaveClass(/fluid-ready/);
  await expect(surface).toBeVisible();
  expect(errors).toEqual([]);
});

test("pixel masks reveal the project image as it enters view", async ({ page }) => {
  await page.goto("/work/markdownpad");
  const image = page.locator(".pixel-reveal");
  await image.scrollIntoViewIfNeeded();
  await expect(image).toHaveClass(/pixel-ready/);
  await page.evaluate(() => {
    const image = document.querySelector(".pixel-reveal")!;
    window.scrollTo({ top: image.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
  });
  await expect.poll(() => image.locator(".reveal-pixel").evaluateAll((pixels) => pixels.every((pixel) => Number(getComputedStyle(pixel).opacity) < 0.05))).toBe(true);
  await expect(image.locator("img")).toBeVisible();
});

test("the story remains readable and the gooey contact link works with a keyboard", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const story = page.getByRole("region", { name: "My approach" });
  await story.scrollIntoViewIfNeeded();
  await expect(story).toContainText("First, understand the problem.");
  await expect(story.locator(".story-word").last()).toHaveCSS("opacity", "1");
  const contact = page.getByRole("link", { name: "Start a conversation" });
  await contact.scrollIntoViewIfNeeded();
  await contact.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/contact$/);
});

test("internal pages blend through a view transition and reduced motion skips it", async ({ page, isMobile }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const start = document.startViewTransition;
    document.documentElement.dataset.transitionCount = "0";
    if (!start) return;
    document.startViewTransition = function(...args) {
      document.documentElement.dataset.transitionCount = String(Number(document.documentElement.dataset.transitionCount) + 1);
      return Reflect.apply(start, document, args);
    };
  });
  await expect(page.getByText("Hi, I’m Razak.", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Explore my work", exact: true }).click();
  await expect(page).toHaveURL(/\/work$/);
  await expect(page.locator("html")).toHaveAttribute("data-transition-count", "1");
  await expect.poll(() => page.locator("html").getAttribute("class")).not.toMatch(/route-transitioning/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
  const nav = page.getByRole("navigation", { name: isMobile ? "Mobile navigation" : "Main navigation" });
  await nav.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator("html")).toHaveAttribute("data-transition-count", "1");
});

test("project filters include requested replacements and lead to their case studies", async ({
  page,
  isMobile,
}) => {
  await page.goto("/work");
  await expect(page.locator(".project-card")).toHaveCount(5);
  if (!isMobile) {
    const card = page.locator(".project-card").first();
    await card.scrollIntoViewIfNeeded();
    const bounds = (await card.boundingBox())!;
    await page.mouse.move(bounds.x + bounds.width * 0.75, bounds.y + bounds.height * 0.25);
    await expect.poll(() => card.evaluate((element) => getComputedStyle(element).transform)).toMatch(/^matrix3d/);
    await page.mouse.move(0, 0);
    await expect.poll(() => card.evaluate((element) => getComputedStyle(element).transform)).toBe("none");
  }
  await expect(
    page.getByRole("link", { name: "Read E-Wallet API case study" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Developer Tools" }).click();
  await expect(page.locator(".project-card")).toHaveCount(1);
  await page.getByRole("link", { name: "Read MarkdownPad case study" }).click();
  await expect(page).toHaveURL(/\/work\/markdownpad$/);
  await expect(page.locator("h1")).toContainText("MarkdownPad");
  await page.getByRole("link", { name: "All work", exact: true }).click();
  await page.getByRole("button", { name: "Web Experiences" }).click();
  await expect(
    page.getByRole("link", { name: "Read Fly High case study" }),
  ).toBeVisible();
});

test("project numbers explain the features and test payment limits", async ({
  page,
}) => {
  await page.goto("/work/kyklos");
  await page.locator(".metric-source summary").first().click();
  await expect(page.locator(".metric-source").first()).toContainText(
    "access rules",
  );
  await page
    .getByRole("heading", { name: "Good to know" })
    .scrollIntoViewIfNeeded();
  await expect(page.locator(".project-note")).toContainText("test mode");
  await expect(
    page.getByRole("link", { name: "View frontend prototype" }),
  ).toHaveAttribute("href", "https://kyklos-rzk.vercel.app");
});

test("contact validates fields and hands a valid message to an email draft", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/contact");
  const help = page.locator(".help-panel");
  await help.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(help.locator("p")).toBeVisible();
  await expect(help).toContainText("review the message and send it from there");
  await page.getByRole("button", { name: "Open email draft" }).click();
  await expect(page.getByLabel("Your name")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page.getByLabel("Your name").fill("Alex Example");
  await page.getByLabel("Email address").fill("invalid");
  await page.getByLabel("Email address").blur();
  await expect(page.getByLabel("Email address")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page.getByLabel("Email address").fill("alex@example.com");
  await page
    .getByLabel("What are you thinking?")
    .fill("I would like to discuss a software engineering opportunity.");
  const client = await context.newCDPSession(page);
  await client.send("Page.enable");
  const draft = new Promise<string>((resolve) =>
    client.on("Page.frameRequestedNavigation", (event) => {
      if (event.url.startsWith("mailto:")) resolve(event.url);
    }),
  );
  await page.getByRole("button", { name: "Open email draft" }).click();
  expect(decodeURIComponent(await draft)).toContain(
    "Reply to: alex@example.com",
  );
  await expect(page.getByRole("status")).toContainText(
    "Your email app was requested",
  );
  await page.getByRole("button", { name: "rienchy.razak@gmail.com" }).click();
  await expect(page.getByText("Email copied", { exact: true })).toBeVisible();
});

test("theme changes reveal a circle from the button and release it before navigation", async ({ page, isMobile }) => {
  await page.goto("/about");
  const toggle = page.getByRole("button", { name: "Switch to dark theme" });
  const bounds = (await toggle.boundingBox())!;
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter((animation) =>
    "animationName" in animation && animation.animationName === "theme-reveal"
  ).length)).toBe(1);
  const origin = await page.evaluate(() => [
    document.documentElement.style.getPropertyValue("--theme-x"),
    document.documentElement.style.getPropertyValue("--theme-y"),
  ].map(parseFloat));
  expect(origin[0]).toBeCloseTo(bounds.x + bounds.width / 2);
  expect(origin[1]).toBeCloseTo(bounds.y + bounds.height / 2);
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("navigation", { name: isMobile ? "Mobile navigation" : "Main navigation" })
    .getByRole("link", { name: "Work", exact: true }).click();
  await expect(page).toHaveURL(/\/work$/);
  await expect.poll(() => page.locator("html").getAttribute("class")).not.toMatch(/theme-transitioning|route-transitioning/);
  await expect(page.locator("h1")).toBeVisible();
});

test("theme changes stay instant with reduced motion or no view transition support", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/contact");
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).not.toHaveClass(/theme-transitioning/);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => Object.defineProperty(document, "startViewTransition", { value: undefined, configurable: true }));
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).not.toHaveClass(/theme-transitioning/);
});

test("theme and responsive navigation remain usable", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "About" })
      .click();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  } else {
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "About" })
      .click();
  }
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("reduced motion exposes the full timeline without scroll animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/about");
  await page
    .getByRole("heading", { name: "Putting lessons to work." })
    .scrollIntoViewIfNeeded();
  await expect(page.locator(".journey")).not.toHaveClass(/emaki-enabled/);
  await expect(
    page.getByRole("heading", { name: "Putting lessons to work." }),
  ).toBeVisible();
});

test("unknown case studies return a useful 404", async ({ page }) => {
  const response = await page.goto("/work/missing-project");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
});

test("desktop timeline unfolds to the final experience card", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Mobile displays a stacked timeline.");
  await page.goto("/about");
  await expect(page.locator(".journey")).toHaveClass(/emaki-enabled/);
  await page.evaluate(() => {
    const section = document.querySelector(".journey")!;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: top + section.clientHeight - window.innerHeight,
      behavior: "instant",
    });
  });
  await expect
    .poll(() =>
      page
        .locator(".journey-track")
        .evaluate((element) => getComputedStyle(element).transform),
    )
    .not.toBe("none");
  await expect
    .poll(() =>
      page
        .locator(".journey-card")
        .last()
        .evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return bounds.left >= 0 && bounds.right <= window.innerWidth;
        }),
    )
    .toBe(true);
});
