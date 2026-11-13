'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { LANDING_SECTIONS } from './sections';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const updateHeight = () => {
      document.documentElement.style.setProperty(
        '--nav-h',
        `${nav.getBoundingClientRect().height}px`,
      );
    };
    const observer = new ResizeObserver(updateHeight);
    observer.observe(nav);
    updateHeight();
    return () => observer.disconnect();
  }, []);

  return (
    <nav ref={navRef} data-landing-navbar className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-red-100/80 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-8xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        <Link href="#home" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-black text-base shadow-md shadow-red-600/30">S</div>
          <div className="leading-tight">
            <p className="font-black text-zinc-900 text-[15px] tracking-tight">SOFTNEX</p>
            <p className="font-bold text-red-600 text-[9px] tracking-[0.22em] -mt-0.5">COMMERCE OS</p>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-5">
          {LANDING_SECTIONS.map((section) => (
            <Link
              key={section.id}
              href={`#${section.id}`}
              className="text-[13px] font-medium text-zinc-500 transition-colors hover:text-red-600"
            >
              {section.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2.5">
          <Link href="/auth/login" className="text-[13px] font-semibold text-zinc-600 hover:text-zinc-900 transition-colors px-3 py-1.5">
            Login
          </Link>
          <Link href="/auth/login" className="text-[13px] font-bold text-white bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md shadow-red-500/25">
            Get Started
          </Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-zinc-600 p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-red-100 px-4 py-4 space-y-1">
          {LANDING_SECTIONS.map((section) => (
            <Link
              key={section.id}
              href={`#${section.id}`}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[13px] font-medium text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded-lg px-3 py-2 transition-colors"
            >
              {section.label}
            </Link>
          ))}
          <div className="pt-3 flex gap-2">
            <Link href="/auth/login" className="flex-1 text-center text-[13px] font-semibold border border-zinc-200 text-zinc-700 py-2.5 rounded-xl">Login</Link>
            <Link href="/auth/login" className="flex-1 text-center text-[13px] font-bold text-white bg-gradient-to-r from-red-500 to-red-600 py-2.5 rounded-xl">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}