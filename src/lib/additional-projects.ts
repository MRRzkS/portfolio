import type { Project } from "./content";
export const additionalProjects: Project[] = [
  {
    slug: "markdownpad",
    name: "MarkdownPad",
    category: "Developer Tools",
    featured: false,
    eyebrow: "WRITE IT. PREVIEW IT. EXPORT IT.",
    summary:
      "A Markdown editor with live preview and clean PDF exports. Your writing stays in your browser.",
    image: "/markdownpad.webp",
    stack: ["Next.js", "TypeScript", "CodeMirror", "react-to-print"],
    repository: "https://github.com/MRRzkS/online-markdown-editor",
    demo: "https://online-markdown-editor-olive.vercel.app",
    role: "Frontend developer",
    metrics: [
      {
        value: "190+",
        label: "code languages",
        detail: "Code highlighting for over 190 languages, using highlight.js.",
      },
      {
        value: "3",
        label: "export formats",
        detail: "Save as PDF, HTML, or Markdown.",
      },
      {
        value: "2",
        label: "paper sizes",
        detail:
          "Choose A4 or Letter, then adjust margins, text size, and page breaks.",
      },
    ],
    challenge:
      "Writing Markdown is simple. Turning it into a clean PDF can be harder, especially with code, tables, and page breaks.",
    approach: [
      "Used CodeMirror for editing and one Markdown renderer for both preview and print.",
      "Used the browser print engine to keep text sharp, links clickable, and pages properly split.",
      "Added PDF, HTML, and Markdown export, writing stats, and a toolbar that works with the selected text.",
    ],
    outcome:
      "Built an editor with three export formats, two paper sizes, and code highlighting for over 190 languages.",
    note: "PDF export opens the browser print dialog. Choose Save as PDF to download the document.",
  },
  {
    slug: "fly-high",
    name: "Fly High",
    category: "Web Experiences",
    featured: false,
    eyebrow: "A DAILY ROUTINE, READY ANYWHERE",
    summary:
      "A volleyball training app that works offline, guides each session, and keeps track of your progress.",
    image: "/fly-high.webp",
    stack: ["JavaScript", "PWA", "Web Audio", "Service Worker"],
    repository: "https://github.com/MRRzkS/fly-high",
    demo: "https://mrrzks.github.io/fly-high/",
    role: "Frontend and PWA developer",
    metrics: [
      {
        value: "5",
        label: "training phases",
        detail: "Warm-up, strength, jump power, conditioning, and cooldown.",
      },
      {
        value: "4",
        label: "session checks",
        detail: "Checks for illness, pain, sleep, and food before a session.",
      },
      {
        value: "0",
        label: "package dependencies",
        detail:
          "Built with JavaScript, HTML, and CSS, without a framework or build step.",
      },
    ],
    challenge:
      "A daily training app needs to work on a phone, keep progress, and stay available without a connection.",
    approach: [
      "Made the app installable, with a cached app shell for offline use and local progress backups.",
      "Built five training phases with timers, audio cues, vibration on supported devices, and a screen wake lock.",
      "Added four session checks, a lighter routine option, daily streaks, and reduced-motion support.",
    ],
    outcome:
      "Built an offline training app with five phases, four session checks, and no runtime package dependencies.",
    note: "Open the app online once before using it offline. Training results have not been measured.",
  },
];
