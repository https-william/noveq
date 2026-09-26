import { Metadata } from 'next';
import Link from 'next/link';
import { getAllPolicies } from '@/data/policies';
import { ShieldCheck, Calendar, FileText, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Policies & Standards — Shipping, Exchanges & Leather Care',
  description:
    'Versioned operational guidelines: shipping schedules, size exchange rules, genuine leather care, and privacy standards.',
  alternates: {
    canonical: '/policies',
  },
  openGraph: {
    title: 'Policies & Standards | NOVEQ',
    description:
      'Versioned operational guidelines: shipping schedules, size exchange rules, genuine leather care, and privacy standards.',
    url: '/policies',
    siteName: 'NOVEQ',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Policies & Standards | NOVEQ',
    description:
      'Versioned operational guidelines: shipping schedules, size exchange rules, genuine leather care, and privacy standards.',
  },
};

export default function PoliciesPage() {
  const policies = getAllPolicies();

  return (
    <div className="py-12 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="pb-8 border-b border-cocoa/20">
        <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block mb-2">
          Governance & Care
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink-black">
          Policies & Service Standards
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-taupe max-w-2xl leading-relaxed">
          Versioned policies governing Drop 001 releases, tracked logistics, unworn exchanges, and leather care.
        </p>
      </div>

      {/* Quick Navigation Anchor Bar */}
      <div className="py-6 border-b border-cocoa/15 flex flex-wrap gap-2 text-xs">
        {policies.map((policy) => (
          <a
            key={policy.id}
            href={`#${policy.id}`}
            className="px-3 py-1.5 bg-warm-white border border-cocoa/30 text-ink-black rounded-xs hover:border-ink-black transition-colors"
          >
            {policy.title}
          </a>
        ))}
      </div>

      {/* Versioned Policy Records */}
      <div className="pt-10 space-y-16">
        {policies.map((policy) => (
          <article
            key={policy.id}
            id={policy.id}
            className="scroll-mt-24 bg-warm-white border border-cocoa/25 rounded-sm p-6 sm:p-10 shadow-xs space-y-6"
          >
            {/* Policy Title & Version Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-cocoa/15 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 bg-bone border border-cocoa/30 font-mono text-[10px] text-cocoa font-semibold rounded-xs">
                    {policy.version}
                  </span>
                  {policy.isDraft && (
                    <span className="px-2 py-0.5 bg-oxblood/10 border border-oxblood/20 text-[10px] text-oxblood uppercase tracking-wider font-semibold rounded-xs">
                      Working Draft
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-ink-black">
                  {policy.title}
                </h2>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-taupe">
                <Calendar className="w-3.5 h-3.5" />
                <span>Effective: {policy.effectiveDate}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-ink-black/85 leading-relaxed font-normal">
              {policy.summary}
            </p>

            {/* Sections */}
            <div className="space-y-6 pt-2">
              {policy.sections.map((section, sIdx) => (
                <div
                  key={sIdx}
                  className={`space-y-1.5 ${
                    section.isPendingClientDecision
                      ? 'p-4 bg-bone/70 border border-dashed border-cocoa/40 rounded-xs'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs uppercase tracking-[0.16em] font-bold text-ink-black">
                      {section.heading}
                    </h3>
                    {section.isPendingClientDecision && (
                      <span className="px-2 py-0.5 bg-espresso text-warm-white text-[9px] uppercase tracking-wider rounded-xs font-semibold">
                        Needs Client Decision
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-ink-black/80">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* Support Route Callout */}
      <div className="mt-16 p-8 bg-espresso text-warm-white rounded-sm border border-cocoa/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-taupe-on-dark block font-medium">
            Personal Concierge Support
          </span>
          <h3 className="text-lg font-bold text-warm-white">
            Have questions about fit, care, or delivery?
          </h3>
          <p className="text-xs text-muted-taupe-on-dark max-w-md">
            Our client services team assists with sizing confirmations and dispatch status directly.
          </p>
        </div>

        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 bg-warm-white text-ink-black text-xs uppercase tracking-[0.18em] font-semibold rounded-xs hover:bg-bone transition-colors shrink-0"
        >
          <span>Contact Concierge</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
