import { additionalProjects } from "./additional-projects";

export const profile = {
  name: "Muhammad Rienchy Razak Simatupang",
  shortName: "Razak",
  email: "rienchy.razak@gmail.com",
  github: "https://github.com/MRRzkS",
  linkedin: "https://www.linkedin.com/in/rienchy-razak",
  cv: "/cv_muhammad-rienchy-razak-simatupang_software-engineer.pdf",
};
export type Metric = { value: string; label: string; detail: string };
export type Project = {
  slug: string;
  name: string;
  category: "Applied AI" | "Systems" | "Developer Tools" | "Web Experiences";
  featured: boolean;
  eyebrow: string;
  summary: string;
  image?: string;
  stack: string[];
  repository: string;
  demo?: string;
  demoLabel?: string;
  role: string;
  metrics: Metric[];
  challenge: string;
  approach: string[];
  outcome: string;
  note: string;
};

const featuredProjects: Project[] = [
  {
    slug: "briefly-ai",
    name: "Briefly AI",
    category: "Applied AI",
    featured: true,
    eyebrow: "TURN AN IDEA INTO A PLAN",
    summary:
      "An AI tool that turns a rough software idea into a clear plan, from requirements to tasks.",
    image: "/briefly.png",
    stack: ["Next.js", "TypeScript", "OpenRouter", "Zod"],
    repository: "https://github.com/MRRzkS/briefly-ai",
    demo: "https://briefly-ai-beta.vercel.app",
    role: "Full-stack developer",
    metrics: [
      {
        value: "5",
        label: "parts in each plan",
        detail:
          "A project brief, requirements, user stories, acceptance criteria, and a task list.",
      },
      {
        value: "12/min",
        label: "request limit",
        detail:
          "Each IP address can make up to 12 requests per minute. This limit helps protect the AI service.",
      },
      {
        value: "8",
        label: "saved plans",
        detail:
          "The browser keeps the eight most recent plans on the user's device.",
      },
    ],
    challenge:
      "A rough idea needs more detail before development can begin. I wanted to make that first step easier.",
    approach: [
      "Built a flow that creates five parts of a software plan. Zod checks the AI response before it appears on screen.",
      "Let users rewrite one section at a time and export their full plan as Markdown.",
      "Kept AI calls on the server and saved recent plans in the browser. Added a 4,000-character input limit and a 64 KB request limit.",
    ],
    outcome:
      "Built a working tool that creates five-part plans, saves eight recent plans, and lets users edit and export the result.",
    note: "Plans stay on the user's device. These numbers describe the features and limits of the app.",
  },
  {
    slug: "skillsync",
    name: "SkillSync",
    category: "Applied AI",
    featured: true,
    eyebrow: "HELP PEOPLE FIND THE RIGHT FIT",
    summary:
      "A hiring platform where candidates build their CVs and HR teams review applicants with AI help.",
    image: "/skillsync.png",
    stack: ["Next.js", "Supabase", "PostgreSQL", "AI APIs"],
    repository: "https://github.com/MRRzkS/skillsync",
    demo: "https://skillsync-six-amber.vercel.app",
    role: "HR app developer, one of two full-stack developers",
    metrics: [
      {
        value: "7",
        label: "HR pages built",
        detail: "I built seven pages for the HR side of the app.",
      },
      {
        value: "2",
        label: "AI providers",
        detail: "OpenRouter handles AI requests, with Gemini as a backup.",
      },
      {
        value: "5",
        label: "team members",
        detail:
          "I worked with a five-person team, including two full-stack developers.",
      },
    ],
    challenge:
      "Candidates need a way to show their skills. HR teams need a clear way to review them. Both sides had to work together.",
    approach: [
      "Built the HR pages for job posts, AI questions, scores, candidate lists, and assessment results.",
      "Connected OpenRouter and Gemini so requests have a backup when the main provider reaches its limit.",
      "Joined the HR and candidate flows in one app, using Supabase for sign-in and PostgreSQL for data.",
    ],
    outcome:
      "Built seven HR pages and connected two AI providers as part of a five-person hackathon team.",
    note: "AI scores help with review. They do not replace a hiring decision.",
  },
  {
    slug: "kyklos",
    name: "Kyklos",
    category: "Systems",
    featured: true,
    eyebrow: "KEEP ORDERS AND PAYMENTS IN ORDER",
    summary:
      "A sales and purchasing app with role-based access, server-calculated totals, and test payments.",
    image: "/kyklos.png",
    stack: ["Laravel", "PHP", "MySQL", "Xendit"],
    repository: "https://github.com/MRRzkS/kyklos-laravel",
    demo: "https://kyklos-rzk.vercel.app",
    demoLabel: "View frontend prototype",
    role: "Full-stack developer",
    metrics: [
      {
        value: "18",
        label: "access permissions",
        detail: "The same access rules apply to app pages and API routes.",
      },
      {
        value: "3",
        label: "user roles",
        detail: "Administrator, purchasing staff, and sales staff.",
      },
      {
        value: "3",
        label: "test payment methods",
        detail:
          "Xendit Invoice, Virtual Account, and E-Wallet, all in test mode.",
      },
    ],
    challenge:
      "Different staff need different access to orders and payments. Totals and payment status also need to stay correct.",
    approach: [
      "Set up 18 permissions across three roles, with the same rules on pages and API routes.",
      "Calculated order totals and tax on the server. Archived old records so existing orders keep their links.",
      "Connected three Xendit test payment methods and checked webhook tokens before updating payment status.",
    ],
    outcome:
      "Built purchasing and sales order flows with 18 permissions, three roles, and three test payment methods.",
    note: "Payments run in test mode. The live demo shows the separate frontend prototype.",
  },
];
export const timeline = [
  {
    date: "2024 TO PRESENT",
    title: "Building for real businesses.",
    label: "Freelance Web Developer",
    body: "Delivered five company websites across four business sectors. Built content dashboards for two clients so their teams could update their own sites.",
    number: "05",
    metric: "client websites delivered",
  },
  {
    date: "2024 TO 2028 EXPECTED",
    title: "Learning the basics.",
    label: "Universitas Pancasila",
    body: "Studying Informatics Engineering, including algorithms, databases, software development, and AI.",
    number: "3.86",
    metric: "GPA / 4.00",
  },
  {
    date: "JUL TO OCT 2026",
    title: "Putting lessons to work.",
    label: "Maxy Academy · Backend Batch 26",
    body: "Completed 17 assignments in web development, databases, Python, and AI. Helped build Vero AI's Opportunity Radar and fixed a session-cookie security issue.",
    number: "17",
    metric: "hands-on assignments",
  },
];
export const projects: Project[] = [...featuredProjects, ...additionalProjects];
