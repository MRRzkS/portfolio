"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { flushSync } from "react-dom";
import { revealTheme } from "@/lib/theme-transition";
const links = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
export function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  function toggleTheme(button: HTMLButtonElement) {
    const nextDark = document.documentElement.dataset.theme !== "dark";
    revealTheme(button, () => {
      document.documentElement.dataset.theme = nextDark ? "dark" : "light";
      flushSync(() => setDark(nextDark));
    });
  }
  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link
          href="/"
          className="wordmark"
          aria-label="Razak home"
          onClick={() => setMenuOpen(false)}
        >
          rr<span>.</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={
                (href === "/" ? pathname === "/" : pathname.startsWith(href))
                  ? "page"
                  : undefined
              }
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-tools">
          <button
            className="icon-button"
            onClick={(event) => toggleTheme(event.currentTarget)}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <Link href="/contact" className="nav-contact">
            Let’s talk <ArrowUpRight size={15} />
          </Link>
          <button
            className="icon-button mobile-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {menuOpen ? (
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {label}
              <ArrowUpRight size={20} />
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
