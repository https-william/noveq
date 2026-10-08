'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import SearchDialog from './SearchDialog';
import { useCart } from '@/context/CartContext';

interface HeaderProps {
  cartCount?: number;
}

const NAV_LINKS = [
  { name: 'Shop', href: '/shop' },
  { name: 'Our Story', href: '/story' },
  { name: 'Journal', href: '/journal' },
  { name: 'Contact', href: '/contact' },
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
    cartCount > 0 ? `View bag - ${cartCount} ${cartCount === 1 ? 'item' : 'items'}` : 'View bag - empty';

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-colors duration-200 border-b border-zinc-900 ${
          isScrolled ? 'bg-[var(--noveq-black)]/95 backdrop-blur-md shadow-md' : 'bg-[var(--noveq-black)]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Left: Official Serif "noveq" wordmark with delicate underline */}
          <div className="flex-1 flex items-center">
            <Link
              href="/"
              className="group inline-flex flex-col items-start py-1 text-warm-white focus-dark"
              aria-label="noveq homepage"
            >
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.25em] lowercase text-[var(--noveq-ivory)] font-normal leading-none select-none">
                noveq
              </span>
              <span className="w-full h-[1px] bg-[var(--noveq-ivory)]/70 mt-1 transition-opacity group-hover:bg-[var(--noveq-ivory)]" />
            </Link>
          </div>

          {/* Center: Desktop navigation links (Shop / Our Story / Journal / Contact) */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center justify-center space-x-8 lg:space-x-12"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs uppercase tracking-[0.2em] text-[var(--noveq-sand)] hover:text-[var(--noveq-ivory)] transition-colors py-2 focus-dark font-medium"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right: Actions (Search + Bag on desktop, Bag + Menu on mobile) */}
          <div className="flex-1 flex items-center justify-end space-x-2 sm:space-x-4">
            {/* Search Icon / Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search catalog"
              className="p-2 sm:p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--noveq-sand)] hover:text-[var(--noveq-ivory)] transition-colors focus-dark rounded-sm"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Shopping Bag Button with Live Badge */}
            <button
              type="button"
              onClick={openDrawer}
              aria-label={bagAriaLabel}
              className="relative p-2 sm:p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--noveq-sand)] hover:text-[var(--noveq-ivory)] transition-colors focus-dark rounded-sm"
            >
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-[var(--noveq-ivory)] text-[var(--noveq-black)] text-[10px] font-bold rounded-full flex items-center justify-center leading-none"
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button (collapsed view) */}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              className="md:hidden p-2 sm:p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--noveq-sand)] hover:text-[var(--noveq-ivory)] transition-colors focus-dark rounded-sm"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
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
          <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-900">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex flex-col items-start py-1 text-[var(--noveq-ivory)] focus-dark"
              aria-label="noveq homepage"
            >
              <span className="font-serif text-2xl tracking-[0.25em] lowercase text-[var(--noveq-ivory)] font-normal leading-none select-none">
                noveq
              </span>
              <span className="w-full h-[1px] bg-[var(--noveq-ivory)]/70 mt-1" />
            </Link>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--noveq-sand)] hover:text-[var(--noveq-ivory)] transition-colors focus-dark rounded-sm"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-6 py-12 flex flex-col justify-between overflow-y-auto">
            <nav aria-label="Mobile site links" className="space-y-6">
              {NAV_LINKS.map((link) => (
                <div key={link.name}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-2xl font-medium tracking-tight text-[var(--noveq-ivory)] hover:text-[var(--noveq-sand)] py-2 focus-dark"
                  >
                    {link.name}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Mobile Footer / Secondary Links */}
            <div className="pt-8 border-t border-zinc-900 space-y-6">
              <div className="flex items-center justify-between text-xs tracking-[0.16em] uppercase text-[var(--noveq-sand)]">
                <Link
                  href="/policies"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[var(--noveq-ivory)] py-2 focus-dark"
                >
                  Policies
                </Link>
                <a
                  href="https://instagram.com/noveqthebrand"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--noveq-ivory)] py-2 focus-dark"
                >
                  Instagram
                </a>
              </div>

              <div className="text-[11px] text-[var(--noveq-sand)]/80 tracking-widest uppercase">
                noveq / crafted to move.
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
