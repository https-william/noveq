'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarPlus, ArrowRight } from 'lucide-react';
import { useBlackFriday } from '@/hooks/useBlackFriday';
import { downloadBlackFridayCalendarInvite } from '@/config/blackFriday';

export function BlackFridayRibbon() {
  const { phase, isLive, isPreview, mounted, countdown } = useBlackFriday();

  if (phase === 'ended' && !isPreview) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="November 27 24-Hour Edit notice"
      className="bg-[#111111] text-[#f4f3ef] border-b border-[#b89b72]/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-[11px]">
        {/* Left: Plain, honest announcement */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[#b89b72] font-semibold uppercase tracking-[0.18em] text-[10px]">
            <span
              className={`w-1.5 h-1.5 rounded-full bg-[#b89b72] ${
                isLive ? 'animate-pulse' : ''
              }`}
              aria-hidden="true"
            />
            {isLive ? 'Nov 27 · 24-Hour Edit Live' : 'Nov 27 · 24-Hour Edit'}
          </span>

          {isPreview && (
            <span className="px-1.5 py-0.5 rounded bg-[#b89b72]/20 border border-[#b89b72]/40 text-[#b89b72] text-[9px] uppercase tracking-[0.14em] font-medium">
              Preview
            </span>
          )}

          <span className="text-[#cecbbe]">
            25% off all pairs for 24 hours ·{' '}
            <span className="text-[#f4f3ef]">delivery fees excluded</span>
          </span>
        </div>

        {/* Right: Quiet countdown + direct action */}
        <div className="flex items-center gap-4 ml-auto">
          {mounted && (
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono tabular-nums text-[10px] tracking-[0.12em] text-[#cecbbe]">
              <span className="text-[#b89b72]">
                {isLive ? 'Ends in' : 'Opens in'}
              </span>
              {!isLive && <span>{countdown.days}d</span>}
              <span>{countdown.hours}h</span>
              <span>{countdown.minutes}m</span>
              <span>{countdown.seconds}s</span>
            </span>
          )}

          {isLive ? (
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-[#b89b72] hover:text-[#f4f3ef] transition-colors font-semibold"
            >
              <span>Shop Edit</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={downloadBlackFridayCalendarInvite}
                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-[#b89b72] hover:text-[#f4f3ef] transition-colors font-medium"
              >
                <CalendarPlus className="w-3 h-3" aria-hidden="true" />
                <span>Add Date</span>
              </button>
              <Link
                href="/#the-24hr-edit"
                className="hidden md:inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-[#cecbbe] hover:text-[#f4f3ef] transition-colors"
              >
                <span>Details</span>
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
