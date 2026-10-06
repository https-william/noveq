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
    alt: 'NOVEQ The Twist Slide Pam sculptural strap detail on sunlit stone plinth',
    caption: 'Drop 001: The Twist. Sculptural calfskin vamp contoured for effortless daily stride.',
  },
  {
    id: 'post-2',
    image: '/images/models/the-bar-model.jpg',
    alt: 'NOVEQ The Bar Slide Pam on model in sunlit architectural setting',
    caption: 'Drop 001: The Bar. Polished brass bar accentuating a refined low-profile sole.',
  },
  {
    id: 'post-3',
    image: '/images/editorial/artisan-workshop.jpg',
    alt: 'Artisan workbench in Nigeria with hand-beveled leather soles and brass calipers',
    caption: 'Workbench notes: hand-beveled 45° edges, vegetal oils, and tempered arch balance.',
  },
  {
    id: 'post-4',
    image: '/images/models/the-doubleskin-model.jpg',
    alt: 'NOVEQ The Double Skin Slide Pam styled with tailored linen on model',
    caption: 'Drop 001: The Double Skin. Minimalist dual-strap geometry contoured for everyday movement.',
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
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-black">
              On the Bench & In Movement
            </h3>
          </div>

          <InstagramLink
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            placement="instagram_strip_heading"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-espresso hover:text-ink-black underline underline-offset-4 focus-dark min-h-[44px]"
            aria-label={`Follow ${handle} on Instagram (opens in new tab)`}
          >
            <InstagramIcon className="w-4 h-4" />
            <span>Follow {handle} on Instagram</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </InstagramLink>
        </div>
      )}

      {/* Grid of Curated Brand & Workshop Posts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {CURATED_POSTS.map((post) => (
          <InstagramLink
            key={post.id}
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            placement="instagram_strip_grid"
            className="group relative aspect-square bg-bone border border-cocoa/20 rounded-xs overflow-hidden block focus-dark"
            aria-label={`Instagram post: ${post.caption}`}
          >
            <Image
              src={post.image}
              alt={post.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 280px"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            {/* Subtle Hover Overlay */}
            <div className="absolute inset-0 bg-espresso/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4 text-warm-white">
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
