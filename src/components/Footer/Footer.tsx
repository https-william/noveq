import Link from 'next/link';
import InstagramIcon from '@/components/icons/InstagramIcon';
import { InstagramLink } from '@/components/Analytics/InstagramLink';
import { SITE_SETTINGS } from '@/config/siteSettings';
import { FooterNewsletter } from './FooterNewsletter';

interface FooterProps {
  /** Optional override for legal business block when populated from CMS */
  legalBusinessDetails?: string;
  /** Optional override for payment/delivery block when populated from CMS */
  paymentDeliveryNote?: string;
}

const FOOTER_NAV_LINKS = [
  { name: 'Shop', href: '/shop' },
  { name: 'Story', href: '/story' },
  { name: 'Journal', href: '/journal' },
  { name: 'Contact', href: '/contact' },
  { name: 'Policies', href: '/policies' },
];

export default function Footer({
  legalBusinessDetails,
  paymentDeliveryNote,
}: FooterProps) {
  return (
    <footer
      aria-label="Site footer"
      className="bg-ink-black text-warm-white border-t border-cocoa/30 pt-16 pb-12 sm:pt-20 sm:pb-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Row 1: Brand Wordmark & Primary Navigation */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 pb-12 border-b border-cocoa/20">
          <div>
            <Link
              href="/"
              className="inline-flex flex-col items-start py-1 text-warm-white focus-dark"
              aria-label="noveq homepage"
            >
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.25em] lowercase text-warm-white font-normal leading-none select-none">
                noveq
              </span>
              <span className="w-full h-[1px] bg-warm-white/70 mt-1" />
            </Link>
            <p className="mt-3 text-sm text-muted-taupe-on-dark max-w-sm font-normal leading-relaxed">
              Contemporary leather footwear. Thoughtfully designed around everyday movement, refined form, and personal detail.
            </p>
          </div>

          {/* 1. Nav in required order: Shop / Story / Journal / Contact / Policies */}
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-8 gap-y-4 items-center"
          >
            {FOOTER_NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs uppercase tracking-[0.18em] text-muted-taupe-on-dark hover:text-warm-white transition-colors py-1 focus-dark"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Row 2: Community, VIP Register, & CMS Details */}
        <div className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs text-muted-taupe-on-dark border-b border-cocoa/20">
          {/* 1. VIP Register / Email Retention */}
          <div className="space-y-3">
            <span className="block text-[11px] uppercase tracking-[0.2em] text-warm-white/70">
              Drop Priority Register
            </span>
            <p className="text-xs text-muted-taupe-on-dark leading-relaxed">
              Receive private reservation links and allocation alerts for upcoming drops.
            </p>
            <FooterNewsletter />
          </div>

          {/* 2. Instagram link/icon */}
          <div className="space-y-3">
            <span className="block text-[11px] uppercase tracking-[0.2em] text-warm-white/70">
              Community
            </span>
            <InstagramLink
              href={SITE_SETTINGS.socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              placement="footer_community"
              className="inline-flex items-center gap-2.5 text-muted-taupe-on-dark hover:text-warm-white transition-colors py-1 focus-dark"
              aria-label="Follow NOVEQ on Instagram"
            >
              <InstagramIcon className="w-4 h-4 text-warm-white/80" aria-hidden="true" />
              <span className="text-xs tracking-wider">{SITE_SETTINGS.socialLinks.instagramHandle}</span>
            </InstagramLink>
          </div>

          {/* 3. Legal business details */}
          <div className="space-y-2">
            <span className="block text-[11px] uppercase tracking-[0.2em] text-warm-white/70">
              Provenance & Atelier
            </span>
            {legalBusinessDetails ? (
              <div className="text-muted-taupe-on-dark leading-relaxed whitespace-pre-line text-xs">
                {legalBusinessDetails}
              </div>
            ) : (
              <p className="text-xs text-muted-taupe-on-dark leading-relaxed">
                NOVEQ Atelier. Contemporary leather footwear handcrafted in Nigeria. Distributed nationwide with tracked courier dispatch.
              </p>
            )}
          </div>

          {/* 4. Payment & Delivery */}
          <div className="space-y-2">
            <span className="block text-[11px] uppercase tracking-[0.2em] text-warm-white/70">
              Payment & Delivery
            </span>
            {paymentDeliveryNote ? (
              <div className="text-muted-taupe-on-dark leading-relaxed whitespace-pre-line text-xs">
                {paymentDeliveryNote}
              </div>
            ) : (
              <p className="text-xs text-muted-taupe-on-dark leading-relaxed">
                Paystack 256-bit encrypted checkout. Tracked courier dispatch across all Nigerian states within 24–48 hours.
              </p>
            )}
          </div>
        </div>

        {/* Row 3: 5. Sign-off line set in a small treatment: "noveq / crafted to move." */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <p className="text-muted-taupe-on-dark/80 text-[11px] tracking-wide">
            © {new Date().getFullYear()} NOVEQ. All rights reserved.
          </p>

          <div
            className="text-xs uppercase tracking-[0.24em] font-medium text-warm-white/90 select-none py-1"
            aria-label="Brand sign-off"
          >
            noveq / crafted to move.
          </div>
        </div>
      </div>
    </footer>
  );
}
