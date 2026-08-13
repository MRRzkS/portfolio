'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '/#work', label: 'Work' },
  { href: '/#stack', label: 'Stack' },
  { href: '/#about', label: 'About' },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Leaving the page should not leave the panel hanging open behind the next one.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <nav className="nav">
      <div className="nav-pill">
        <Link className="mark" href="/">
          RAZAK<span>.</span>
        </Link>

        <ul className="nav-links">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>

        <Link className="nav-cta" href="/#contact">
          Get in touch
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </div>

      <div id="nav-menu" className={open ? 'nav-menu open' : 'nav-menu'}>
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        ))}
        <Link className="menu-cta" href="/#contact" onClick={() => setOpen(false)}>
          Get in touch
        </Link>
      </div>
    </nav>
  );
}
