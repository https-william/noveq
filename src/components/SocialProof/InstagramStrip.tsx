'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Play } from 'lucide-react';
import InstagramIcon from '@/components/icons/InstagramIcon';
import { InstagramLink } from '@/components/Analytics/InstagramLink';
import { SITE_SETTINGS } from '@/config/siteSettings';

declare global {
  interface Window {
    instgrm?: {
      Embeds?: {
        process: () => void;
      };
    };
  }
}

interface InstagramReelItem {
  id: string;
  permalink: string;
  label: string;
  caption: string;
  fallbackImage: string;
  fallbackAlt: string;
  productHref?: string;
  productCta?: string;
}

const CURATED_REELS: InstagramReelItem[] = [
  {
    id: 'DeguzSTIfNc',
    permalink: 'https://www.instagram.com/reel/DeguzSTIfNc/?utm_source=ig_embed&utm_campaign=loading',
    label: 'The Weave · Army Green',
    caption: 'The Weave in Army Green. Braided soft leather seen up close and in movement.',
    fallbackImage: '/images/products/the-weave-army-green.jpg',
    fallbackAlt: 'NOVEQ The Weave Slide Pam in Army Green Reel preview',
    productHref: '/shop/the-weave-slide-pam',
    productCta: 'Shop The Weave',
  },
  {
    id: 'Dee8L1bID3i',
    permalink: 'https://www.instagram.com/reel/Dee8L1bID3i/?utm_source=ig_embed&utm_campaign=loading',
    label: 'Drop 001 · In Movement',
    caption: 'Everyday ease from Lagos. Soft Nigerian leather that moves with your stride.',
    fallbackImage: '/images/products/the-weave-black.jpg',
    fallbackAlt: 'NOVEQ Drop 001 leather pam movement Reel preview',
  },
  {
    id: 'DebcvY2O-v7',
    permalink: 'https://www.instagram.com/reel/DebcvY2O-v7/?utm_source=ig_embed&utm_campaign=loading',
    label: 'Lagos Studio · Craft',
    caption: 'Behind our small-batch Drop 001 leather pams shaped in Lagos.',
    fallbackImage: '/images/editorial/artisan-workshop.jpg',
    fallbackAlt: 'NOVEQ Lagos workshop craft Reel preview',
  },
];

interface InstagramStripProps {
  className?: string;
  showHeading?: boolean;
}

export function InstagramStrip({
  className = '',
  showHeading = true,
}: InstagramStripProps) {
  const instagramUrl = SITE_SETTINGS.socialProof.instagramUrl;
  const handle = SITE_SETTINGS.socialProof.instagramHandle;

  useEffect(() => {
    const processEmbeds = () => {
      try {
        window.instgrm?.Embeds?.process();
      } catch {
        // Ignore third-party script initialization timing issues
      }
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="instagram.com/embed.js"]'
    );

    if (existingScript) {
      processEmbeds();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    script.onload = processEmbeds;
    document.body.appendChild(script);
  }, []);

  return (
    <div className={`space-y-8 ${className}`}>
      {showHeading && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block mb-2">
              Studio Reels
            </span>
            <h3 className="font-editorial text-2xl sm:text-4xl font-normal tracking-[-0.01em] text-ink-black">
              On the Bench &amp; In Movement
            </h3>
          </div>

          <InstagramLink
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            placement="instagram_strip_heading"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-semibold text-espresso hover:text-ink-black underline underline-offset-8 decoration-cocoa/40 hover:decoration-ink-black transition-[color,text-decoration-color] duration-[180ms] focus-dark py-2"
            aria-label={`Follow ${handle} on Instagram (opens in new tab)`}
          >
            <InstagramIcon className="w-4 h-4" />
            <span>Follow {handle}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </InstagramLink>
        </div>
      )}

      {/* 3-Column Live Instagram Reels Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-start">
        {CURATED_REELS.map((reel) => (
          <div
            key={reel.id}
            className="min-w-0 bg-warm-white border border-cocoa/15 rounded-2xl overflow-hidden shadow-apple-sm flex flex-col"
          >
            {/* Card Eyebrow Bar */}
            <div className="px-4 py-3 border-b border-cocoa/10 flex items-center justify-between gap-2 text-xs">
              <span className="font-medium text-ink-black truncate">{reel.label}</span>
              {reel.productHref && reel.productCta ? (
                <Link
                  href={reel.productHref}
                  className="text-[11px] uppercase tracking-[0.14em] font-semibold text-cocoa hover:text-ink-black underline underline-offset-4 shrink-0"
                >
                  {reel.productCta}
                </Link>
              ) : (
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted-taupe shrink-0">
                  {handle}
                </span>
              )}
            </div>

            {/* Responsive Embed Container (falls back gracefully if embed.js is blocked) */}
            <div className="w-full overflow-hidden bg-warm-white">
              <blockquote
                className="instagram-media"
                data-instgrm-captioned
                data-instgrm-permalink={reel.permalink}
                data-instgrm-version="14"
                style={{
                  background: '#FAF8F4',
                  border: 0,
                  borderRadius: '0px',
                  boxShadow: 'none',
                  margin: 0,
                  maxWidth: '100%',
                  minWidth: 0,
                  padding: 0,
                  width: '100%',
                }}
              >
                <a
                  href={reel.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group relative aspect-[4/5] w-full bg-bone overflow-hidden focus-dark"
                >
                  <Image
                    src={reel.fallbackImage}
                    alt={reel.fallbackAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover hover-image-zoom"
                  />
                  <div className="absolute inset-0 bg-ink-black/30 flex flex-col items-center justify-center p-6 text-center text-warm-white">
                    <span className="w-12 h-12 rounded-full bg-warm-white/95 text-ink-black flex items-center justify-center shadow-apple-md mb-3 group-hover:scale-105 transition-transform">
                      <Play className="w-4 h-4 fill-ink-black ml-0.5" />
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.18em] font-semibold">
                      Watch Reel on Instagram
                    </span>
                    <p className="mt-2 text-xs text-warm-white/85 max-w-[240px] leading-relaxed">
                      {reel.caption}
                    </p>
                  </div>
                </a>
              </blockquote>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
