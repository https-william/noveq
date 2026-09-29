import React from 'react';
import { InstagramStrip } from './InstagramStrip';
import { CustomerProofSection } from './CustomerProofSection';
import { PressMentions } from './PressMentions';
import { CustomerProof } from '@/types/content';

interface SocialProofSectionProps {
  className?: string;
  testimonials?: CustomerProof[];
  showInstagramStrip?: boolean;
  showCustomerProof?: boolean;
  showPressMentions?: boolean;
}

export function SocialProofSection({
  className = '',
  testimonials = [],
  showInstagramStrip = true,
  showCustomerProof = true,
  showPressMentions = true,
}: SocialProofSectionProps) {
  return (
    <section
      aria-label="Community, Movement & Visuals"
      className={`py-20 sm:py-28 bg-bone border-b border-cocoa/15 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        {/* Instagram Strip */}
        {showInstagramStrip && <InstagramStrip />}

        {/* Customer Proof / Testimonials (active when reviews exist) */}
        {showCustomerProof && testimonials && testimonials.length > 0 && (
          <CustomerProofSection testimonials={testimonials} />
        )}

        {/* Press Mentions (Off by default per site config) */}
        {showPressMentions && <PressMentions />}
      </div>
    </section>
  );
}
