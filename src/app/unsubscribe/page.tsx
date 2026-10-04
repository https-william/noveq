'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, MailX } from 'lucide-react';

export default function UnsubscribePage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Unable to unsubscribe right now. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Network interruption. Please check your connection.');
    }
  };

  return (
    <div className="py-20 sm:py-32 max-w-xl mx-auto px-4 sm:px-6">
      <div className="bg-warm-white border border-cocoa/20 rounded-xs p-8 sm:p-10 shadow-xs space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-taupe hover:text-ink-black uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return Home</span>
        </Link>

        {status === 'success' ? (
          <div className="space-y-4 text-center py-6">
            <div className="w-12 h-12 rounded-full bg-cocoa/10 border border-cocoa/30 flex items-center justify-center mx-auto text-cocoa">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-ink-black">You are unsubscribed</h1>
            <p className="text-sm text-muted-taupe leading-relaxed">
              We have removed <span className="font-semibold text-ink-black">{email}</span> from our email list. You will no longer receive release announcements or promotions from us.
            </p>
            <div className="pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-6 py-3 bg-espresso text-warm-white text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-ink-black transition-colors"
              >
                Return to Collection
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-bone border border-cocoa/20 flex items-center justify-center text-espresso">
                <MailX className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-ink-black">Manage Email Preferences</h1>
                <p className="text-xs text-muted-taupe">Opt out of NOVEQ announcements anytime.</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-muted-taupe leading-relaxed">
              Enter your email address below to remove yourself from our newsletter, drop releases, and subscriber updates.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="unsub-email" className="block text-[11px] uppercase tracking-wider font-semibold text-cocoa mb-1">
                  Email Address
                </label>
                <input
                  id="unsub-email"
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-bone border border-cocoa/30 rounded-xs focus-dark text-ink-black"
                />
              </div>

              {status === 'error' && (
                <div className="p-3 bg-oxblood/10 border border-oxblood/30 text-oxblood text-xs rounded-xs">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3.5 bg-ink-black text-warm-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-espresso transition-colors rounded-xs disabled:opacity-50 min-h-[44px]"
              >
                {status === 'loading' ? 'Updating...' : 'Unsubscribe from Emails'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
