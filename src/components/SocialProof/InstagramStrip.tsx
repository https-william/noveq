import React from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { InstagramIcon } from '@/components/icons/InstagramIcon';
import { SITE_SETTINGS } from '@/config/siteSettings';
import { InstagramLink } from '@/components/Analytics/InstagramLink';

interface InstagramPostItem {
  id: string;
  image: string;
  alt: string;
  caption: string;
}

const CURATED_POSTS: InstagramPostItem[] = [
  {
    id: 'post-1',
    image: '/images/products/the-twist.jpg',
    alt: 'NOVEQ The Twist Slide Pam sculptural strap detail',
    caption: 'Drop 001: The Twist. Sculptural calfskin vamp contoured for effortless daily stride.',
  },
  {
    id: 'post-2',
    image: '/images/products/the-ring-warm-cognac.jpg',
    alt: 'NOVEQ The Ring Slide Pam in Warm Cognac with gold statement ring',
    caption: 'Drop 001: The Ring. Solid gold statement ring anchoring full-grain Nigerian leather.',
  },
  {
    id: 'post-3',
    image: '/images/editorial/artisan-workshop.jpg',
    alt: 'Artisan workbench in Nigeria with hand-beveled leather soles and brass calipers',
    caption: 'Workbench notes: hand-beveled 45-degree edges, vegetal oils, and tempered arch balance.',
  },
  {
    id: 'post-4',
    image: '/images/products/the-weave-black.jpg',
    alt: 'NOVEQ The Weave Slide Pam braided leather strap architecture',
    caption: 'Drop 001: The Weave. Interlocking multi-strap braided cowhide for tactile elegance.',
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

  return (
    <div className={`space-y-8 ${className}`}>
      {showHeading && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block mb-2">
              Studio Visuals
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

      {/* Grid of Curated Brand & Workshop Posts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
        {CURATED_POSTS.map((post) => (
          <InstagramLink
            key={post.id}
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            placement="instagram_strip_grid"
            className="group relative aspect-square bg-bone border border-cocoa/15 rounded-xl overflow-hidden block focus-dark shadow-apple-sm transition-transform duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98]"
            aria-label={`Instagram post: ${post.caption}`}
          >
            <Image
              src={post.image}
              alt={post.alt}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover hover-image-zoom"
            />
            {/* Subtle Hover Overlay */}
            <div className="absolute inset-0 bg-ink-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col justify-between p-4 text-warm-white">
              <div className="flex justify-end">
                <InstagramIcon className="w-4 h-4 text-warm-white/80" />
              </div>
              <p className="text-[11px] leading-snug line-clamp-3 text-warm-white/90">
                {post.caption}
              </p>
              <span className="text-[10px] uppercase tracking-widest text-muted-taupe-on-dark font-medium">
                {handle}
              </span>
            </div>
          </InstagramLink>
        ))}
      </div>
    </div>
  );
}
