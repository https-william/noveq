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
    cartCount > 0 ? `View bag — ${cartCount} ${cartCount === 1 ? 'item' : 'items'}` : 'View bag — empty';

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-colors duration-200 bg-ink-black border-b border-cocoa/30 ${
          isScrolled ? 'bg-ink-black/95 backdrop-blur-md shadow-md' : 'bg-ink-black'
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
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.25em] lowercase text-warm-white font-normal leading-none select-none">
                noveq
              </span>
              <span className="w-full h-[1px] bg-warm-white/70 mt-1 transition-opacity group-hover:bg-warm-white" />
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
                className="text-xs uppercase tracking-[0.2em] text-warm-white/85 hover:text-warm-white transition-colors py-2 focus-dark font-medium"
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
              className="p-2 sm:p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-warm-white/80 hover:text-warm-white transition-colors focus-dark rounded-sm"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Shopping Bag Button with Live Badge */}
            <button
              type="button"
              onClick={openDrawer}
              aria-label={bagAriaLabel}
              className="relative p-2 sm:p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-warm-white/80 hover:text-warm-white transition-colors focus-dark rounded-sm"
            >
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-warm-white text-ink-black text-[10px] font-bold rounded-full flex items-center justify-center leading-none"
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
              className="md:hidden p-2 sm:p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-warm-white/80 hover:text-warm-white transition-colors focus-dark rounded-sm"
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
          className="fixed inset-0 z-50 bg-ink-black text-warm-white flex flex-col md:hidden transition-opacity duration-200"
        >
          {/* Mobile Overlay Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-cocoa/30">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex flex-col items-start py-1 text-warm-white focus-dark"
              aria-label="noveq homepage"
            >
              <span className="font-serif text-2xl tracking-[0.25em] lowercase text-warm-white font-normal leading-none select-none">
                noveq
              </span>
              <span className="w-full h-[1px] bg-warm-white/70 mt-1" />
            </Link>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-taupe-on-dark hover:text-warm-white transition-colors focus-dark rounded-sm"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation Links (Dedicated mobile composition) */}
          <div className="flex-1 px-6 py-12 flex flex-col justify-between overflow-y-auto">
            <nav aria-label="Mobile site links" className="space-y-6">
              {NAV_LINKS.map((link) => (
                <div key={link.name}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-2xl font-medium tracking-tight text-warm-white hover:text-muted-taupe-on-dark py-2 focus-dark"
                  >
                    {link.name}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Mobile Footer / Secondary Links */}
            <div className="pt-8 border-t border-cocoa/30 space-y-6">
              <div className="flex items-center justify-between text-xs tracking-[0.16em] uppercase text-muted-taupe-on-dark">
                <Link
                  href="/policies"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-warm-white py-2 focus-dark"
                >
                  Policies
                </Link>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-warm-white py-2 focus-dark"
                >
                  Instagram
                </a>
              </div>

              <div className="text-[11px] text-muted-taupe-on-dark/80 tracking-widest uppercase">
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
