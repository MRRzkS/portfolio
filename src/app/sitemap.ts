import type { MetadataRoute } from 'next';
import { getProjects } from '@/lib/queries';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rienchy-razak.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();

  return [
    { url: siteUrl, changeFrequency: 'monthly', priority: 1 },
    ...projects.map((project) => ({
      url: `${siteUrl}/work/${project.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
