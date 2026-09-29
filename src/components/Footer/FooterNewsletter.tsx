'use client';

import { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';

export function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'footer_newsletter',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe.');
      }

      setSubmitted(true);
      setEmail('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-3 bg-espresso/70 border border-cocoa/30 rounded-xs flex items-center gap-2 text-xs text-warm-white">
        <Check className="w-3.5 h-3.5 text-cocoa shrink-0" />
        <span>You are registered for priority release notifications.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-1.5">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          aria-label="Email for release updates"
          className="flex-1 px-3 py-2 bg-espresso/60 border border-cocoa/30 text-warm-white placeholder:text-muted-taupe-on-dark text-xs focus:outline-none focus:border-warm-white/70 rounded-xs min-h-[38px]"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3.5 py-2 bg-warm-white text-ink-black hover:bg-bone text-[11px] uppercase tracking-wider font-semibold rounded-xs transition-colors shrink-0 min-h-[38px] flex items-center justify-center disabled:opacity-50"
          aria-label="Submit email"
        >
          {loading ? '...' : <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      </div>
      {error && <p className="text-[11px] text-oxblood">{error}</p>}
    </form>
  );
}
