import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SITE_SETTINGS } from '@/config/siteSettings';

interface PressMentionsProps {
  className?: string;
}

export function PressMentions({ className = '' }: PressMentionsProps) {
  // Built as an optional toggle in site config. Off by default.
  // Turns on ONLY when confirmed press links are added.
  if (
    !SITE_SETTINGS.socialProof.pressMentionsEnabled ||
    SITE_SETTINGS.socialProof.pressMentions.length === 0
  ) {
    return null;
  }

  return (
    <div className={`py-12 border-t border-cocoa/20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-taupe block font-medium">
          Selected Press & Coverage
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SITE_SETTINGS.socialProof.pressMentions.map((mention) => (
            <div key={mention.id} className="space-y-2">
              <p className="font-serif italic text-lg sm:text-xl text-espresso">
                “{mention.quote}”
              </p>
              <div className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider text-muted-taupe font-medium">
                <span>{mention.publication}</span>
                {mention.url && (
                  <a
                    href={mention.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-cocoa hover:text-ink-black focus-dark"
                  >
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
