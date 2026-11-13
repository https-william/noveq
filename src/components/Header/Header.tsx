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
        className={`sticky top-0 z-40 w-full transition-[background-color,border-color,box-shadow] duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] border-b border-warm-white/10 ${
          isScrolled ? 'bg-[var(--noveq-black)]/95 backdrop-blur-md shadow-sm' : 'bg-[var(--noveq-black)]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Left: Mobile Menu Button (< md) or Maison Primary Links (md+) */}
          <div className="flex items-center justify-start">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              className="md:hidden -ml-2 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--noveq-sand)] hover:text-[var(--noveq-ivory)] transition-[color,transform] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.95] focus-dark rounded-full"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>

            <nav
              aria-label="Primary collection links"
              className="hidden md:flex items-center space-x-6 lg:space-x-10"
            >
              {NAV_LINKS.slice(0, 2).map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[11px] uppercase tracking-[0.22em] text-[var(--noveq-sand)] hover:text-[var(--noveq-ivory)] transition-[color,opacity] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] py-2 whitespace-nowrap focus-dark font-medium"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: Poised Maison "noveq" Wordmark */}
          <div className="flex items-center justify-center">
            <Link
              href="/"
              className="group inline-flex flex-col items-center py-1 text-warm-white transition-transform duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-dark"
              aria-label="noveq homepage"
            >
              <span className="font-serif text-2xl sm:text-[1.75rem] tracking-[0.28em] pl-[0.28em] lowercase text-[var(--noveq-ivory)] font-normal leading-none select-none">
                noveq
              </span>
              <span className="w-8 h-[1px] bg-[var(--noveq-ivory)]/45 mt-1.5 transition-[width,background-color] duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:w-full group-hover:bg-[var(--noveq-ivory)]" />
            </Link>
          </div>

          {/* Right: Editorial Links (md+) + Search & Bag */}
          <div className="flex items-center justify-end space-x-1 sm:space-x-3 lg:space-x-6">
            <nav
              aria-label="Editorial links"
              className="hidden md:flex items-center space-x-6 lg:space-x-10 mr-1 lg:mr-2"
            >
              {NAV_LINKS.slice(2).map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[11px] uppercase tracking-[0.22em] text-[var(--noveq-sand)] hover:text-[var(--noveq-ivory)] transition-[color,opacity] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] py-2 whitespace-nowrap focus-dark font-medium"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Search Icon / Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search catalog"
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--noveq-sand)] hover:text-[var(--noveq-ivory)] transition-[color,transform] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.95] focus-dark rounded-full"
            >
              <Search className="w-[18px] h-[18px]" aria-hidden="true" />
            </button>

            {/* Shopping Bag Button with Live Badge */}
            <button
              type="button"
              onClick={openDrawer}
              aria-label={bagAriaLabel}
              className="relative p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--noveq-sand)] hover:text-[var(--noveq-ivory)] transition-[color,transform] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.95] focus-dark rounded-full"
            >
              <ShoppingBag className="w-[18px] h-[18px]" aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 right-1.5 min-w-[17px] h-[17px] px-1 bg-[var(--noveq-ivory)] text-[var(--noveq-black)] text-[10px] font-semibold rounded-full flex items-center justify-center leading-none tabular-nums"
                >
                  {cartCount}
                </span>
              )}
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
