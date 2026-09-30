import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import localFont from "next/font/local";
import { Footer } from "@/components/footer";
import { RouteFocus } from "@/components/motion";
import { PageTransitions } from "@/components/page-motion";
import { SmoothScroll } from "@/components/smooth-scroll";
import "lenis/dist/lenis.css";
import "./globals.css";
import "./motion.css";
import "./kanso.css";
const geist = localFont({
  src: "../fonts/geist-latin.woff2",
  variable: "--font-geist",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: {
    default: "Razak · Software Engineer",
    template: "%s · Razak",
  },
  description:
    "Full-stack software engineer in Depok, Indonesia. Explore AI products, reliable backend systems, and measurable project outcomes.",
  openGraph: {
    title: "Razak · Software Engineer",
    description: "Clear code. Real results.",
    type: "website",
    locale: "en_US",
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Navigation />
        <RouteFocus />
        <PageTransitions />
        <SmoothScroll />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
