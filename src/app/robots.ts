import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rienchy-razak.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    // The public site is meant to be found. The dashboard is not.
    rules: [{ userAgent: '*', allow: '/', disallow: '/admin/' }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
