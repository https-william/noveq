'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarPlus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useBlackFriday } from '@/hooks/useBlackFriday';
import { downloadBlackFridayCalendarInvite } from '@/config/blackFriday';

export function BlackFridayEditorialSection() {
  const { phase, isLive, isPreview } = useBlackFriday();
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
      className="bg-warm-white text-ink-black border-b border-cocoa/12 py-20 sm:py-28"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Statement with Inline Specimen */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium">
                {isLive
                  ? 'Live Today · Midnight to 11:59 PM WAT'
                  : 'Seasonal Note · Friday, November 27'}
              </span>
              {isPreview && (
                <span className="px-2.5 py-0.5 rounded-full bg-bone border border-cocoa/15 text-cocoa text-[10px] font-medium">
                  Preview
                </span>
              )}
            </div>

            <h2
              id="the-24hr-edit-heading"
              className="font-editorial text-3xl sm:text-5xl font-normal tracking-[-0.015em] text-ink-black leading-[1.12] text-balance"
            >
              The 24-Hour{' '}
              <span className="inline-block relative w-14 sm:w-20 h-9 sm:h-11 rounded-full overflow-hidden align-middle mx-1 border border-cocoa/15 bg-bone">
                <Image
                  src="/images/products/the-ring-warm-cognac.jpg"
                  alt="NOVEQ leather craftsmanship"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </span>{' '}
              Edit.
              <span className="block text-espresso/80 mt-1.5">
                25% off Drop 001 for one day.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-muted-taupe leading-relaxed max-w-xl text-pretty">
              On Friday, November 27, every available silhouette crafted in our
              Lagos studio is 25% off for 24 hours. No code is needed — the
              reduction applies quietly in your bag, while courier zone rates
              stay unchanged.
            </p>

            {/* Understated Metadata Hairline */}
            <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-espresso border-t border-cocoa/12">
              <span>Midnight – 11:59 PM WAT</span>
              <span className="text-muted-taupe">Automatic in bag · Excludes courier fee</span>
            </div>
          </div>

          {/* Right Column: Double-Bezel Reminder Frame */}
          <div className="lg:col-span-5">
            <div className="p-1.5 rounded-[26px] bg-bone/85 border border-cocoa/12">
              <div className="p-6 sm:p-8 rounded-[20px] bg-warm-white border border-cocoa/10 shadow-[0_2px_14px_-4px_rgba(42,27,21,0.06)] space-y-5">
                {isLive ? (
                  <>
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-medium text-cocoa block">
                        Active Today
                      </span>
                      <h3 className="font-editorial text-2xl font-normal text-ink-black">
                        The edit is open in the shop
                      </h3>
                      <p className="text-xs text-muted-taupe leading-relaxed">
                        Every available silhouette reflects 25% off automatically before standard zone delivery is added.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-bone/50 border border-cocoa/12 space-y-2 text-xs">
                      <div className="flex justify-between text-muted-taupe">
                        <span>Sample pair (₦20,000)</span>
                        <span className="font-mono text-ink-black font-medium tabular-nums">
                          ₦15,000
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-taupe">
                        <span>Standard zone delivery</span>
                        <span className="font-mono">Standard rate</span>
                      </div>
                    </div>

                    <Link
                      href="/shop"
                      className="group press-tactile w-full pl-6 pr-2 py-2 bg-ink-black hover:bg-espresso text-warm-white rounded-full text-xs font-medium transition-[background-color,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] inline-flex items-center justify-between min-h-[48px]"
                    >
                      <span>Shop Available Pairs</span>
                      <span className="w-8 h-8 rounded-full bg-warm-white text-ink-black flex items-center justify-center transition-transform duration-[200ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-medium text-cocoa block">
                        Private Reminder
                      </span>
                      <h3 className="font-editorial text-2xl font-normal text-ink-black">
                        Receive notice when doors open
                      </h3>
                      <p className="text-xs text-muted-taupe leading-relaxed">
                        Small-batch pairs are limited. Leave your email and we will write once on November 27.
                      </p>
                    </div>

                    {status === 'saved' ? (
                      <div className="p-4 rounded-xl bg-bone/50 border border-cocoa/15 flex items-start gap-3 text-xs text-ink-black">
                        <CheckCircle2
                          className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <p className="leading-relaxed">{feedback}</p>
                      </div>
                    ) : (
                      <form onSubmit={handleReminderSubmit} className="space-y-3">
                        <div>
                          <label htmlFor="bf-reminder-email" className="sr-only">
                            Email address for November 27 reminder
                          </label>
                          <input
                            id="bf-reminder-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 bg-bone/50 border border-cocoa/18 rounded-xl text-xs text-ink-black placeholder:text-muted-taupe/70 focus:outline-none focus:border-ink-black transition-colors"
                            required
                          />
                        </div>

                        {status === 'error' && feedback && (
                          <p className="text-[11px] text-oxblood">{feedback}</p>
                        )}

                        <button
                          type="submit"
                          disabled={status === 'submitting'}
                          className="group press-tactile w-full pl-6 pr-2 py-2 bg-ink-black hover:bg-espresso text-warm-white rounded-full text-xs font-medium transition-[background-color,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] inline-flex items-center justify-between min-h-[48px] disabled:opacity-60 cursor-pointer"
                        >
                          <span>
                            {status === 'submitting'
                              ? 'Saving reminder...'
                              : 'Notify Me on November 27'}
                          </span>
                          <span className="w-8 h-8 rounded-full bg-warm-white text-ink-black flex items-center justify-center transition-transform duration-[200ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                          </span>
                        </button>
                      </form>
                    )}

                    <div className="pt-2.5 border-t border-cocoa/12 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={downloadBlackFridayCalendarInvite}
                        className="inline-flex items-center gap-1.5 text-xs text-espresso hover:text-ink-black transition-colors font-medium cursor-pointer"
                      >
                        <CalendarPlus className="w-3.5 h-3.5 text-cocoa" aria-hidden="true" />
                        <span>Add to Calendar (.ics)</span>
                      </button>

                      <Link
                        href="/shop"
                        className="text-xs text-muted-taupe hover:text-ink-black underline underline-offset-4 transition-colors"
                      >
                        Explore Drop 001
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
