'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarPlus, ArrowRight, X } from 'lucide-react';
import { useBlackFriday } from '@/hooks/useBlackFriday';
import { downloadBlackFridayCalendarInvite } from '@/config/blackFriday';

const DISMISS_STORAGE_KEY = 'nvq_seasonal_note_dismissed';

export function BlackFridayRibbon() {
  const { phase, isLive, isPreview } = useBlackFriday();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_STORAGE_KEY) === '1') {
        setDismissed(true);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  if ((phase === 'ended' && !isPreview) || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_STORAGE_KEY, '1');
    } catch {
      // ignore storage errors
    }
  };

  return (
    <div
      role="region"
      aria-label="November 27 seasonal edit notice"
      className="bg-[#161513] text-[#d6d0c4] border-b border-white/[0.06]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-3 text-[11px]">
        {/* Left spacer on desktop for optical centering */}
        <div className="hidden md:block w-16" aria-hidden="true" />

        {/* Center: Understated seasonal whisper */}
        <div className="flex items-center gap-2.5 truncate">
          <span className="text-[var(--noveq-ivory)] font-medium">
            {isLive ? 'November 27 · The 24-Hour Edit' : 'Friday, November 27 · The 24-Hour Edit'}
          </span>

          {isPreview && (
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-[var(--noveq-sand)] text-[10px]">
              Preview
            </span>
          )}

          <span className="hidden sm:inline text-white/30">|</span>

          <span className="hidden sm:inline text-[var(--noveq-sand)]/85 truncate">
            {isLive
              ? '25% off Drop 001 footwear applied automatically in bag.'
              : '25% off Drop 001 footwear for one day.'}
          </span>

          {isLive ? (
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 text-[var(--noveq-ivory)] hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-colors ml-1 shrink-0"
            >
              <span>Explore</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-3 ml-1 shrink-0">
              <button
                type="button"
                onClick={downloadBlackFridayCalendarInvite}
                className="inline-flex items-center gap-1 text-[var(--noveq-ivory)] hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-colors cursor-pointer"
              >
                <CalendarPlus className="w-3 h-3 text-[var(--noveq-brass)]" aria-hidden="true" />
                <span>Save date</span>
              </button>
              <Link
                href="/#the-24hr-edit"
                className="hidden sm:inline-flex items-center gap-0.5 text-[var(--noveq-sand)] hover:text-white transition-colors"
              >
                <span>Details</span>
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </span>
          )}
        </div>

        {/* Right: Quiet Dismiss */}
        <div className="flex items-center justify-end md:w-16 shrink-0">
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss seasonal notice"
            className="p-1.5 -mr-1.5 text-[var(--noveq-sand)]/70 hover:text-[var(--noveq-ivory)] transition-colors rounded-full cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
