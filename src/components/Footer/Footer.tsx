import Link from 'next/link';
import InstagramIcon from '@/components/icons/InstagramIcon';
import { InstagramLink } from '@/components/Analytics/InstagramLink';
import { SITE_SETTINGS } from '@/config/siteSettings';

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

        {/* Row 2: Instagram link/icon + CMS Placeholders */}
        <div className="py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-muted-taupe-on-dark border-b border-cocoa/20">
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

          {/* 3. Legal business details placeholder block (Clearly-marked CMS field) */}
          <div className="space-y-2">
            <span className="block text-[11px] uppercase tracking-[0.2em] text-warm-white/70">
              Legal Business Details
            </span>
            {legalBusinessDetails ? (
              <div className="text-muted-taupe-on-dark leading-relaxed whitespace-pre-line">
                {legalBusinessDetails}
              </div>
            ) : (
              <div className="p-3 bg-espresso/60 border border-cocoa/30 rounded-xs text-[11px] leading-relaxed text-muted-taupe-on-dark">
                <span className="font-semibold text-warm-white/80 uppercase tracking-widest block mb-1">
                  CMS Placeholder // {SITE_SETTINGS.legalEntityName}
                </span>
                Pending final verified business registration, tax identification, and corporate address before launch.
              </div>
            )}
          </div>

          {/* 4. Payment/delivery note placeholder block (Clearly-marked CMS field) */}
          <div className="space-y-2">
            <span className="block text-[11px] uppercase tracking-[0.2em] text-warm-white/70">
              Payment & Delivery
            </span>
            {paymentDeliveryNote ? (
              <div className="text-muted-taupe-on-dark leading-relaxed whitespace-pre-line">
                {paymentDeliveryNote}
              </div>
            ) : (
              <div className="p-3 bg-espresso/60 border border-cocoa/30 rounded-xs text-[11px] leading-relaxed text-muted-taupe-on-dark">
                <span className="font-semibold text-warm-white/80 uppercase tracking-widest block mb-1">
                  CMS Placeholder
                </span>
                Pending payment gateway confirmation and regional shipping dispatch schedule for Drop 001.
              </div>
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
