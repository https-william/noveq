'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CalendarPlus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useBlackFriday } from '@/hooks/useBlackFriday';
import { downloadBlackFridayCalendarInvite } from '@/config/blackFriday';

export function BlackFridayEditorialSection() {
  const { phase, isLive, isPreview, mounted, countdown } = useBlackFriday();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'saved' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  if (phase === 'ended' && !isPreview) {
    return null;
  }

  const handleReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setStatus('error');
      setFeedback('Enter a valid email address so we can send your reminder.');
      return;
    }

    setStatus('submitting');
    setFeedback('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          source: 'black_friday_2026',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not save your reminder right now.');
      }
      setStatus('saved');
      setFeedback("You're on the list. We will message you when the 24-hour edit opens on November 27.");
      setEmail('');
    } catch (err) {
      setStatus('error');
      setFeedback(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    }
  };

  return (
    <section
      id="the-24hr-edit"
      aria-labelledby="the-24hr-edit-heading"
      className="bg-[#111111] text-[#f4f3ef] border-y border-[#b89b72]/25 py-16 sm:py-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Editorial Statement + Clear Rules */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#b89b72] font-semibold">
                {isLive
                  ? 'Live Today · Midnight to 11:59 PM WAT'
                  : 'Friday, November 27 · 24 Hours Only'}
              </span>
              {isPreview && (
                <span className="px-2 py-0.5 rounded-full bg-[#b89b72]/15 border border-[#b89b72]/40 text-[#b89b72] text-[10px] uppercase tracking-[0.14em]">
                  Preview Mode · Live Pricing Unlocks Nov 27
                </span>
              )}
            </div>

            <h2
              id="the-24hr-edit-heading"
              className="font-rayleigh text-3xl sm:text-5xl font-normal tracking-tight text-[#f4f3ef] leading-[1.08]"
            >
              The 24-Hour Edit.
              <span className="block text-[#b89b72] mt-1">
                25% off every pair.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-[#cecbbe] leading-relaxed max-w-xl">
              For 24 hours on Friday, November 27, every pair in the NOVEQ
              collection is 25% off. The reduction applies automatically in your
              bag and at checkout — no code required. Courier delivery fees are
              not discounted and remain at our standard zone rates.
            </p>

            {/* Transparent Clarity Rules Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-[#1c1c1c] border border-[#b89b72]/20 space-y-1">
                <span className="text-[10px] uppercase tracking-[0.16em] text-[#b89b72] block">
                  01 · What&apos;s Included
                </span>
                <p className="text-xs text-[#f4f3ef] font-medium">
                  25% off all available footwear pairs
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#1c1c1c] border border-[#b89b72]/20 space-y-1">
                <span className="text-[10px] uppercase tracking-[0.16em] text-[#b89b72] block">
                  02 · How It Applies
                </span>
                <p className="text-xs text-[#f4f3ef] font-medium">
                  Calculated automatically — no code needed
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#1c1c1c] border border-[#b89b72]/20 space-y-1">
                <span className="text-[10px] uppercase tracking-[0.16em] text-[#b89b72] block">
                  03 · Delivery Fees
                </span>
                <p className="text-xs text-[#f4f3ef] font-medium">
                  Standard zone courier rates still apply
                </p>
              </div>
            </div>

            {/* Quiet Serene Countdown */}
            <div className="pt-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#cecbbe] block mb-2.5">
                {isLive
                  ? 'Time left in the 24-Hour Edit'
                  : 'Countdown to November 27 (00:00 WAT)'}
              </span>
              <div className="inline-flex items-center gap-3 sm:gap-5 px-5 py-3.5 rounded-xl bg-[#1c1c1c] border border-[#b89b72]/25 font-mono tabular-nums">
                {!isLive && (
                  <>
                    <div className="text-center min-w-[2.5rem]">
                      <span className="block text-xl sm:text-2xl text-[#f4f3ef] font-medium">
                        {mounted ? countdown.days : '--'}
                      </span>
                      <span className="text-[9px] uppercase tracking-[0.16em] text-[#cecbbe]">
                        Days
                      </span>
                    </div>
                    <span className="text-[#b89b72]/50 text-lg" aria-hidden="true">:</span>
                  </>
                )}
                <div className="text-center min-w-[2.5rem]">
                  <span className="block text-xl sm:text-2xl text-[#f4f3ef] font-medium">
                    {mounted ? countdown.hours : '--'}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.16em] text-[#cecbbe]">
                    Hours
                  </span>
                </div>
                <span className="text-[#b89b72]/50 text-lg" aria-hidden="true">:</span>
                <div className="text-center min-w-[2.5rem]">
                  <span className="block text-xl sm:text-2xl text-[#f4f3ef] font-medium">
                    {mounted ? countdown.minutes : '--'}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.16em] text-[#cecbbe]">
                    Mins
                  </span>
                </div>
                <span className="text-[#b89b72]/50 text-lg" aria-hidden="true">:</span>
                <div className="text-center min-w-[2.5rem]">
                  <span className="block text-xl sm:text-2xl text-[#b89b72] font-medium">
                    {mounted ? countdown.seconds : '--'}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.16em] text-[#cecbbe]">
                    Secs
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Reminder / Calendar (Upcoming) or Direct Entry (Live) */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#1c1c1c] border border-[#b89b72]/30 space-y-5">
              {isLive ? (
                <>
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#b89b72] font-semibold block">
                      Today Only
                    </span>
                    <h3 className="font-rayleigh text-2xl font-normal text-[#f4f3ef]">
                      25% off is live in the store
                    </h3>
                    <p className="text-xs text-[#cecbbe] leading-relaxed">
                      Every available pair reflects the 24-Hour Edit price. Once
                      you add your size to the bag, your discount appears before
                      courier delivery is added.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#111111] border border-[#b89b72]/20 space-y-2 text-xs">
                    <div className="flex justify-between text-[#cecbbe]">
                      <span>Pair Example (₦20,000)</span>
                      <span className="font-mono text-[#f4f3ef] font-semibold">
                        ₦15,000
                      </span>
                    </div>
                    <div className="flex justify-between text-[#cecbbe]">
                      <span>Lagos Delivery (Standard)</span>
                      <span className="font-mono text-[#cecbbe]">Unchanged</span>
                    </div>
                  </div>

                  <Link
                    href="/shop"
                    className="w-full py-3.5 px-6 bg-[#f4f3ef] hover:bg-[#b89b72] text-[#111111] rounded-md text-xs uppercase tracking-[0.18em] font-semibold transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <span>Shop Available Pairs</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#b89b72] font-semibold block">
                      Private Reminder
                    </span>
                    <h3 className="font-rayleigh text-2xl font-normal text-[#f4f3ef]">
                      Get notified at midnight
                    </h3>
                    <p className="text-xs text-[#cecbbe] leading-relaxed">
                      Pairs are made in small batches. Leave your email and
                      we&apos;ll send one message when the 25% edit opens on
                      November 27.
                    </p>
                  </div>

                  {status === 'saved' ? (
                    <div className="p-4 rounded-xl bg-[#111111] border border-[#b89b72]/40 flex items-start gap-3 text-xs text-[#f4f3ef]">
                      <CheckCircle2
                        className="w-4 h-4 text-[#b89b72] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <p className="leading-relaxed">{feedback}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleReminderSubmit} className="space-y-3">
                      <div>
                        <label
                          htmlFor="bf-reminder-email"
                          className="sr-only"
                        >
                          Email address for November 27 reminder
                        </label>
                        <input
                          id="bf-reminder-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full px-4 py-3 bg-[#111111] border border-[#cecbbe]/25 rounded-md text-xs text-[#f4f3ef] placeholder:text-[#cecbbe]/50 focus:outline-none focus:border-[#b89b72]"
                          required
                        />
                      </div>

                      {status === 'error' && feedback && (
                        <p className="text-[11px] text-[#b89b72]">{feedback}</p>
                      )}

                      <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="w-full py-3.5 px-6 bg-[#f4f3ef] hover:bg-[#b89b72] text-[#111111] rounded-md text-xs uppercase tracking-[0.18em] font-semibold transition-colors disabled:opacity-60"
                      >
                        {status === 'submitting'
                          ? 'Saving Reminder...'
                          : 'Notify Me on Nov 27'}
                      </button>
                    </form>
                  )}

                  <div className="pt-2 border-t border-[#cecbbe]/15 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={downloadBlackFridayCalendarInvite}
                      className="inline-flex items-center gap-2 text-xs text-[#b89b72] hover:text-[#f4f3ef] transition-colors font-medium"
                    >
                      <CalendarPlus className="w-4 h-4" aria-hidden="true" />
                      <span>Add Nov 27 to Calendar (.ics)</span>
                    </button>

                    <Link
                      href="/shop"
                      className="text-[11px] uppercase tracking-[0.14em] text-[#cecbbe] hover:text-[#f4f3ef] underline underline-offset-4"
                    >
                      Browse Pairs Now
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
