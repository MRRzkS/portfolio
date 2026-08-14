import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

/**
 * Both families are variable fonts served from the repository rather than
 * fetched from Google at build time. Self-hosting removes a third-party
 * request from first paint, and removes a network dependency from the build,
 * which otherwise fails for reasons that have nothing to do with the code.
 */
const manrope = localFont({
  src: '../fonts/Manrope.woff2',
  weight: '200 800',
  display: 'swap',
  variable: '--font-manrope',
});

const jetbrains = localFont({
  src: '../fonts/JetBrainsMono.woff2',
  weight: '100 800',
  display: 'swap',
  variable: '--font-jetbrains',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rienchy-razak.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Muhammad Rienchy Razak Simatupang — Software Engineer',
    template: '%s — Rienchy Razak',
  },
  description:
    'Software engineer in Depok building backend systems that stay correct when things fail. Transactions, idempotent retries, and access maps you can audit.',
  openGraph: {
    type: 'website',
    siteName: 'Rienchy Razak',
    url: siteUrl,
    title: 'Muhammad Rienchy Razak Simatupang — Software Engineer',
    description:
      'Backend systems that stay correct when things fail. Four curated projects, each with measured results.',
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/' },
};

/** Structured data so a recruiter (or search engine) reading the shared link gets
 *  a machine-readable identity, not just the rendered page. */
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Muhammad Rienchy Razak Simatupang',
  jobTitle: 'Backend Software Engineer (internship)',
  url: siteUrl,
  email: 'rienchy.razak@gmail.com',
  alumniOf: [
    { '@type': 'CollegeOrUniversity', name: 'Universitas Pancasila' },
    { '@type': 'Organization', name: 'Maxy Academy' },
  ],
  sameAs: ['https://github.com/MRRzkS', 'https://linkedin.com/in/rienchy-razak'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetbrains.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
