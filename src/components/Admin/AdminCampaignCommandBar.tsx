'use client';

import React from 'react';
import { ExternalLink, Bell, Clock, Package } from 'lucide-react';
import { Product } from '@/types/commerce';
import { Subscriber } from '@/lib/subscribers';
import { useBlackFriday } from '@/hooks/useBlackFriday';
import {
  AdminTab,
  SubscriberSegment,
  isNov27Subscriber,
  isRestockSubscriber,
} from './adminUtils';

interface AdminCampaignCommandBarProps {
  products: Product[];
  subscribers: Subscriber[];
  onJumpToTab: (tab: AdminTab, subscriberSegment?: SubscriberSegment) => void;
}

export function AdminCampaignCommandBar({
  products,
  subscribers,
  onJumpToTab,
}: AdminCampaignCommandBarProps) {
  const { phase, isLive, mounted, countdown } = useBlackFriday();

  const nov27Count = subscribers.filter(isNov27Subscriber).length;
  const restockCount = subscribers.filter(isRestockSubscriber).length;

  const restockingStylesCount = products.filter(
    (p) => Boolean(p.restocking) || p.stock <= 0 || p.sizes.every((s) => !s.available)
  ).length;
  const openStylesCount = Math.max(0, products.length - restockingStylesCount);

  return (
    <div className="bg-[#111111] text-[#f4f3ef] border border-[#b89b72]/35 rounded-2xl p-4 sm:p-5 shadow-apple-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Nov 27 Event Readiness */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#b89b72] font-semibold">
              <span
                className={`w-1.5 h-1.5 rounded-full bg-[#b89b72] ${
                  isLive ? 'animate-pulse' : ''
                }`}
                aria-hidden="true"
              />
              Friday, November 27 · The 24-Hour Edit
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#1c1c1c] border border-[#b89b72]/35 text-[10px] font-mono text-[#cecbbe]">
              {phase === 'live'
                ? 'LIVE NOW · 25% OFF PAIRS'
                : phase === 'ended'
                ? 'COMPLETED'
                : 'SCHEDULED · AUTO-ACTIVATES NOV 27'}
            </span>
          </div>

          <p className="text-xs text-[#cecbbe] leading-relaxed">
            25% off all footwear pairs automatically at checkout — standard courier delivery fees stay excluded.
            {mounted && phase !== 'ended' && (
              <span className="ml-2 font-mono tabular-nums text-[#b89b72] font-medium">
                ({isLive ? 'Ends in' : 'Opens in'} {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s)
              </span>
            )}
          </p>
        </div>

        {/* Right: Actionable Audience & Stock Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onJumpToTab('subscribers', 'nov27')}
            className="group inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#b89b72] hover:text-[#111111] border border-[#b89b72]/30 text-xs transition-colors cursor-pointer min-h-[40px]"
          >
            <Bell className="w-3.5 h-3.5 text-[#b89b72] group-hover:text-[#111111]" />
            <span className="font-mono font-bold tabular-nums">{nov27Count}</span>
            <span className="text-[11px] opacity-90">Nov 27 Reminders</span>
          </button>

          <button
            type="button"
            onClick={() => onJumpToTab('subscribers', 'restock')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#b89b72] hover:text-[#111111] border border-[#b89b72]/30 text-xs transition-colors cursor-pointer min-h-[40px]"
          >
            <Clock className="w-3.5 h-3.5 text-[#b89b72]" />
            <span className="font-mono font-bold tabular-nums">{restockCount}</span>
            <span className="text-[11px] opacity-90">Restock Waitlist</span>
          </button>

          <button
            type="button"
            onClick={() => onJumpToTab('products')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#b89b72] hover:text-[#111111] border border-[#b89b72]/30 text-xs transition-colors cursor-pointer min-h-[40px]"
          >
            <Package className="w-3.5 h-3.5 text-[#b89b72]" />
            <span className="text-[11px]">
              {openStylesCount} Open · {restockingStylesCount} Restocking
            </span>
          </button>

          <a
            href="/?bf=preview"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f4f3ef] hover:bg-[#b89b72] text-[#111111] text-[11px] uppercase tracking-[0.14em] font-semibold transition-colors min-h-[40px]"
          >
            <span>Preview Nov 27</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
