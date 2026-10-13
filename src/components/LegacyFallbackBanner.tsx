import React from 'react';
import { SITE_SETTINGS } from '@/config/siteSettings';

/**
 * LegacyFallbackBanner
 * 
 * Appears only on legacy devices (e.g. Safari 12 / iOS 12.5.7) or browsers
 * that lack modern flexbox gap / ES2020 features. Provides a direct, conversational
 * WhatsApp route to order NOVEQ Drop 001 leather pams without getting stuck.
 */
export default function LegacyFallbackBanner() {
  const whatsappUrl = `https://wa.me/${SITE_SETTINGS.supportContact.phone}?text=${encodeURIComponent(
    SITE_SETTINGS.supportContact.directOrderPrompt || 'Hello NOVEQ team, I want to order Drop 001 leather pams.'
  )}`;

  return (
    <>
      <noscript>
        <div className="bg-espresso text-warm-white p-4 text-center text-sm font-sans">
          <span>JavaScript is disabled or not supported by your browser. You can still order Drop 001 handcrafted leather pams directly via WhatsApp: </span>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-bold ml-1 text-bone hover:text-white"
          >
            Chat with us on WhatsApp ({SITE_SETTINGS.supportContact.displayPhone}) →
          </a>
        </div>
      </noscript>

      <div
        id="noveq-legacy-banner"
        className="noveq-legacy-banner hidden bg-espresso text-warm-white px-4 py-2.5 text-xs font-sans border-b border-sand/20"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-warm-white/90">
            <span>Older browser detected. If buttons or cart do not respond, you can browse the designs and order directly on WhatsApp.</span>
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 bg-warm-white text-ink-black rounded text-xs font-medium hover:bg-bone transition-colors"
          >
            Order on WhatsApp →
          </a>
        </div>
      </div>
    </>
  );
}
