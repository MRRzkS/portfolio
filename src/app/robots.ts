import type { MetadataRoute } from "next";
// Set SITE_URL after choosing the final deployment domain.
export default function Robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(process.env.SITE_URL
      ? { sitemap: `${process.env.SITE_URL}/sitemap.xml` }
      : {}),
  };
}
