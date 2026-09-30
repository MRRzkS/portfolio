import type { MetadataRoute } from "next";
import { projects } from "@/lib/content";
export default function Sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.SITE_URL;
  if (!origin) return [];
  return [
    "",
    "/work",
    "/about",
    "/contact",
    ...projects.map((project) => `/work/${project.slug}`),
  ].map((path) => ({ url: `${origin}${path}` }));
}
