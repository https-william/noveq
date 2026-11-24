import { Metadata } from 'next';
import Link from 'next/link';
import { getAllPolicies } from '@/data/policies';
import { ShieldCheck, Calendar, FileText, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Policies & Standards - Shipping, Exchanges & Leather Care',
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
    <div className="py-10 sm:py-16 lg:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="pb-8 border-b border-cocoa/20">
        <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block mb-2">
          Governance &amp; Care
        </span>
        <h1 className="font-editorial text-3xl sm:text-5xl font-normal tracking-[-0.015em] text-ink-black">
          Policies &amp; Service Standards
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-taupe max-w-2xl leading-relaxed">
          Versioned policies governing Drop 001 releases, tracked logistics, unworn exchanges, and leather care.
        </p>
      </div>

      {/* Quick Navigation Anchor Bar */}
      <nav aria-label="Policy sections" className="py-5 border-b border-cocoa/12 flex flex-wrap gap-2 text-xs">
        {policies.map((policy) => (
          <a
            key={policy.id}
            href={`#${policy.id}`}
            className="press-tactile px-4 py-2 bg-warm-white border border-cocoa/15 text-ink-black font-medium rounded-full hover:border-ink-black transition-[border-color,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
          >
            {policy.title}
          </a>
        ))}
      </nav>

      {/* Versioned Policy Records */}
      <div className="divide-y divide-cocoa/12">
        {policies.map((policy) => (
          <article
            key={policy.id}
            id={policy.id}
            className="scroll-mt-24 py-12 grid grid-cols-1 md:grid-cols-12 gap-8"
          >
            {/* Left Sticky Policy Metadata */}
            <div className="md:col-span-4 space-y-2.5 md:sticky md:top-24 md:self-start">
              <span className="inline-block px-2.5 py-0.5 bg-warm-white border border-cocoa/15 font-mono text-[10px] text-cocoa font-medium rounded-full">
                {policy.version}
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-normal tracking-tight text-ink-black">
                {policy.title}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-muted-taupe">
                <Calendar className="w-3.5 h-3.5" />
                <span>Effective {policy.effectiveDate}</span>
              </div>
            </div>

            {/* Right Policy Body */}
            <div className="md:col-span-8 space-y-6">
              <p className="text-sm text-ink-black/90 leading-relaxed font-normal">
                {policy.summary}
              </p>

              <div className="space-y-5 pt-2 border-t border-cocoa/10">
                {policy.sections.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-1.5">
                    <h3 className="text-sm font-medium text-ink-black">
                      {section.heading}
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-ink-black/75">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Support Route Callout */}
      <div className="mt-8 p-7 sm:p-9 bg-[#111111] text-[#f4f3ef] rounded-2xl border border-[#b89b72]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#b89b72] block font-medium">
            Customer Care
          </span>
          <h3 className="font-editorial text-2xl font-normal text-[#f4f3ef]">
            Questions about fit, care, or delivery?
          </h3>
          <p className="text-xs text-[#cecbbe]/85 max-w-md">
            Our Lagos studio team assists directly with EU sizing confirmations and dispatch updates.
          </p>
        </div>

        <Link
          href="/contact"
          className="press-tactile inline-flex items-center gap-2 px-6 py-3 bg-[#f4f3ef] text-[#111111] text-xs font-medium rounded-full hover:bg-[#b89b72] transition-[background-color,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] shrink-0"
        >
          <span>Contact Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
