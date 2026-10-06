'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import SearchDialog from './SearchDialog';
import { useCart } from '@/context/CartContext';

interface HeaderProps {
  cartCount?: number;
}

const NAV_LINKS = [
  { name: 'collection', href: '/collection' },
  { name: 'atelier', href: '/atelier' },
  { name: 'journal', href: '/journal' },
  { name: 'contact', href: '/contact' },
];

export default function Header({ cartCount: initialCartCount }: HeaderProps) {
  const { totalItems, openDrawer } = useCart();
  const cartCount = initialCartCount ?? totalItems;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Sticky transition after 80px scroll threshold
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll and handle keyboard accessibility for mobile menu
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
          menuButtonRef.current?.focus();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  const bagAriaLabel =
    cartCount > 0 ? `View bag — ${cartCount} ${cartCount === 1 ? 'item' : 'items'}` : 'View bag — empty';

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full py-4 sm:py-6 px-4 sm:px-8 border-b border-zinc-900 transition-colors duration-200 ${
          isScrolled
            ? 'bg-[var(--noveq-black)]/95 backdrop-blur-md shadow-[0_12px_32px_var(--noveq-depth-shadow)]'
            : 'bg-[var(--noveq-black)]'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Navigation Menu (Left) */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex flex-1 items-center gap-8 text-sm uppercase tracking-[0.2em] text-[var(--noveq-sand)]"
          >
            <Link
              href="/collection"
              className="hover:text-[var(--noveq-ivory)] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--noveq-ivory)]"
            >
              collection
            </Link>
            <Link
              href="/atelier"
              className="hover:text-[var(--noveq-ivory)] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--noveq-ivory)]"
            >
              atelier
            </Link>
            <Link
              href="/journal"
              className="hover:text-[var(--noveq-ivory)] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--noveq-ivory)]"
            >
              journal
            </Link>
          </nav>

          {/* Mobile hamburger on the far left for responsive balance */}
          <div className="flex md:hidden flex-1 items-center">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              className="p-1 text-[var(--noveq-ivory)] hover:opacity-70 transition-opacity focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--noveq-ivory)]"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Center Brand Identity (compact Logotype) */}
          <Link
            href="/"
            className="flex flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--noveq-ivory)] py-1 group"
            aria-label="NOVEQ — Lagos · Milano"
          >
            <span className="text-[2.2rem] font-serif lowercase text-[var(--noveq-ivory)] tracking-normal leading-none font-normal select-none">
              noveq
            </span>
            <span className="text-[0.55rem] uppercase tracking-[0.3em] text-[var(--noveq-sand)]">
              Lagos &middot; Milano
            </span>
          </Link>

          {/* Action Menu (Right) */}
          <div className="flex-1 flex items-center justify-end gap-6 text-sm uppercase tracking-widest text-[var(--noveq-ivory)]">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search collection"
              className="hover:opacity-70 transition-opacity focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--noveq-ivory)] p-1"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={openDrawer}
              aria-label={bagAriaLabel}
              className="flex items-center gap-1 hover:opacity-70 transition-opacity focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--noveq-ivory)] py-1"
            >
              <span>bag</span>
              <span className="text-xs text-[var(--noveq-sand)]">({cartCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Overlay Navigation */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-50 bg-[var(--noveq-black)] text-[var(--noveq-ivory)] flex flex-col md:hidden transition-opacity duration-200"
        >
          {/* Mobile Overlay Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-zinc-900">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-start gap-1 py-1"
              aria-label="NOVEQ — Lagos · Milano"
            >
              <span className="text-2xl font-serif lowercase text-[var(--noveq-ivory)] leading-none">
                noveq
              </span>
              <span className="text-[0.5rem] uppercase tracking-[0.3em] text-[var(--noveq-sand)]">
                Lagos &middot; Milano
              </span>
            </Link>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="p-2 text-[var(--noveq-sand)] hover:text-[var(--noveq-ivory)] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--noveq-ivory)]"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-8 py-12 flex flex-col justify-between overflow-y-auto">
            <nav aria-label="Mobile site links" className="space-y-6">
              {NAV_LINKS.map((link) => (
                <div key={link.name}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-2xl font-medium tracking-tight text-[var(--noveq-ivory)] hover:text-[var(--noveq-sand)] py-2 uppercase"
                  >
                    {link.name}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Mobile Footer / Secondary Links */}
            <div className="pt-8 border-t border-zinc-900 space-y-6">
              <div className="flex items-center justify-between text-xs tracking-[0.2em] uppercase text-[var(--noveq-sand)]">
                <Link
                  href="/policies"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[var(--noveq-ivory)] py-2"
                >
                  Policies
                </Link>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--noveq-ivory)] py-2"
                >
                  Instagram
                </a>
              </div>

              <div className="text-[11px] text-[var(--noveq-sand)]/70 tracking-[0.25em] uppercase">
                noveq &middot; lagos &middot; milano
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accessible Search Dialog */}
      <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
