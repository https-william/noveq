import React from 'react';
import Image from 'next/image';
import { Sparkles, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { CustomerProof } from '@/types/content';
import { SITE_SETTINGS } from '@/config/siteSettings';
import { InstagramIcon } from '@/components/icons/InstagramIcon';
import { InstagramLink } from '@/components/Analytics/InstagramLink';

interface CustomerProofSectionProps {
  testimonials?: CustomerProof[];
  className?: string;
  variant?: 'standalone' | 'inline-pdp';
}

export function CustomerProofSection({
  testimonials = [],
  className = '',
  variant = 'standalone',
}: CustomerProofSectionProps) {
  const isEnabled =
    SITE_SETTINGS.socialProof.customerProofEnabled && testimonials.length > 0;
  const instagramUrl = SITE_SETTINGS.socialProof.instagramUrl;
  const handle = SITE_SETTINGS.socialProof.instagramHandle;

  // Day 2 state: Render authentic customer reviews when verified testimonials exist
  if (isEnabled) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block">
            Customer Reflections
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-black">
            Worn In Movement
          </h3>
          <p className="text-xs text-muted-taupe">
            Authentic impressions from verified Drop 001 owners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="p-6 bg-warm-white border border-cocoa/20 rounded-xs flex flex-col justify-between space-y-4"
            >
              <blockquote className="space-y-2">
                <p className="text-sm text-ink-black/85 leading-relaxed font-normal">
                  “{item.quote}”
                </p>
              </blockquote>

              <div className="pt-4 border-t border-cocoa/15 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-ink-black flex items-center gap-1.5">
                    <span>{item.author}</span>
                    {item.verifiedPurchase && (
                      <CheckCircle2
                        className="w-3.5 h-3.5 text-cocoa"
                        aria-label="Verified purchase"
                      />
                    )}
                  </div>
                  <div className="text-muted-taupe text-[11px]">
                    {item.location} · {item.productPurchased}
                  </div>
                </div>

                {item.photo && (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-cocoa/30">
                    <Image
                      src={item.photo}
                      alt={item.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Launch state (PDP compact variant)
  if (variant === 'inline-pdp') {
    return (
      <div
        className={`p-5 bg-bone border border-cocoa/20 rounded-xs text-left space-y-3 ${className}`}
      >
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-cocoa font-medium">
          <InstagramIcon className="w-3.5 h-3.5 text-cocoa" />
          <span>Launch Edition · Drop 001</span>
        </div>

        <p className="text-xs text-ink-black/80 leading-relaxed">
          {SITE_SETTINGS.socialProof.customerProofPlaceholderText}
        </p>

        <div>
          <InstagramLink
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            placement="pdp_social_proof_invite"
            className="inline-flex items-center gap-1.5 text-xs text-espresso hover:text-ink-black font-semibold underline underline-offset-4 focus-dark min-h-[44px]"
          >
            <span>Tag {handle} on Instagram</span>
            <ArrowUpRight className="w-3 h-3" />
          </InstagramLink>
        </div>
      </div>
    );
  }

  // Launch state (Standalone section for Homepage or Community page)
  return (
    <div
      className={`max-w-2xl mx-auto text-center border border-dashed border-cocoa/30 p-8 sm:p-12 rounded-xs bg-warm-white/70 space-y-4 ${className}`}
    >
      <div className="w-10 h-10 mx-auto rounded-full bg-bone border border-cocoa/30 flex items-center justify-center text-cocoa">
        <Sparkles className="w-4 h-4" />
      </div>

      <span className="text-[11px] uppercase tracking-[0.2em] text-cocoa block font-medium">
        Honest Launch Architecture
      </span>

      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-ink-black">
        Drop 001 is on its way to its first owners.
      </h3>

      <p className="text-xs sm:text-sm text-muted-taupe leading-relaxed max-w-md mx-auto">
        We refuse to fabricate synthetic reviews, dummy five-star ratings, or artificial press badges. As the first ten pairs reach patrons, verified owner reflections and worn-in photography will be featured here.
      </p>

      <div className="pt-2">
        <InstagramLink
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          placement="homepage_social_proof_invite"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-black text-warm-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-espresso transition-colors rounded-xs focus-dark min-h-[44px]"
        >
          <InstagramIcon className="w-3.5 h-3.5" />
          <span>Tag {handle} on Instagram</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </InstagramLink>
      </div>
    </div>
  );
}
