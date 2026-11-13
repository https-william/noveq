'use client';

import React, { useState } from 'react';

interface MaterialChapter {
  id: string;
  number: string;
  tabLabel: string;
  title: string;
  headline: string;
  description: string;
  notes: string[];
  provenance: string;
}

const CHAPTERS: MaterialChapter[] = [
  {
    id: 'hide',
    number: '01',
    tabLabel: 'The Hide',
    title: 'Vegetable-Tanned Cowhide',
    headline: 'Substantial 2.2mm Nigerian calfskin conditioned with natural beeswax.',
    description:
      'We work exclusively with full-grain hides tanned slowly in plant extracts and organic oils. Rather than stiff synthetic coatings, the leather breathes effortlessly and moulds to your foot contours across two to three wears.',
    notes: [
      'Full-grain aniline finish preserving natural grain',
      'Conditioned by hand with beeswax and natural tallow',
      'Develops a rich individual patina with wear',
    ],
    provenance: 'Northern Nigeria Tannery',
  },
  {
    id: 'edge',
    number: '02',
    tabLabel: 'The Edge',
    title: 'Hand-Beveled Sole Profile',
    headline: 'A sculpted 45-degree sole line sealed with hot carnauba wax.',
    description:
      'Every perimeter is shaved with hand rasps at our Lagos workbench to eliminate heavy visual weight. Heat-burnished carnauba wax leaves a dark satin border built to resist tropical humidity and everyday pavement.',
    notes: [
      'Hand-skived and shaped per pair at the bench',
      'Hot-iron burnished with organic carnauba wax',
      'Moisture-sealed for sunlit stone and rainy streets',
    ],
    provenance: 'Lagos Benchcraft Studio',
  },
  {
    id: 'arch',
    number: '03',
    tabLabel: 'The Arch',
    title: 'Tempered Ergonomic Arch',
    headline: 'Balanced 8mm incline supporting natural stride without heel slap.',
    description:
      'Conventional flat pams tire the instep over long hours. We engineered an 8mm tempered incline and contoured leather footbed that cushions foot strike softly across concrete, tile, and timber.',
    notes: [
      'Contoured instep support shaped for female ergonomics',
      'Dual-density inner cushioning hidden beneath calfskin',
      'Structured heel rim to stabilize daily movement',
    ],
    provenance: 'Anatomical Last Study, Lagos',
  },
  {
    id: 'hardware',
    number: '04',
    tabLabel: 'Cast Brass',
    title: 'Hand-Buffed Brass Hardware',
    headline: 'Solid non-ferrous metalwork anchored cleanly into full-grain straps.',
    description:
      'On The Ring silhouette, custom-cast solid brass anchors the sweeping vamp strap. Hand-buffed to a restrained satin gleam, it carries honest weight and will never flake or peel.',
    notes: [
      'Solid cast brass with hand-buffed satin patina',
      'Reinforced double-rivet mechanical anchorage',
      'Sealed naturally against tropical humidity',
    ],
    provenance: 'Small-Batch Foundry Casting',
  },
];

export function AtelierSpecimenInspector() {
  const [activeId, setActiveId] = useState<string>(CHAPTERS[0].id);
  const activeChapter = CHAPTERS.find((c) => c.id === activeId) || CHAPTERS[0];

  return (
    <section
      aria-label="Savoir-Faire and Materiality"
      className="py-20 sm:py-28 bg-warm-white border-b border-cocoa/15"
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8 space-y-12">
        {/* Centered Maison Heading */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block">
            Savoir-Faire
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-[2.75rem] font-normal tracking-[-0.015em] leading-[1.15] text-ink-black">
            Materials of Permanence
          </h2>
          <p className="text-[15px] sm:text-base text-muted-taupe leading-relaxed">
            Four quiet elements define Drop 001, each finished by hand in our Lagos workshop.
          </p>
        </div>

        {/* Hairline Chapter Selector */}
        <div
          role="tablist"
          aria-label="Footwear craft chapters"
          className="grid grid-cols-2 sm:grid-cols-4 border-b border-cocoa/15"
        >
          {CHAPTERS.map((chapter) => {
            const isActive = chapter.id === activeId;
            return (
              <button
                key={chapter.id}
                role="tab"
                id={`tab-${chapter.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${chapter.id}`}
                type="button"
                onClick={() => setActiveId(chapter.id)}
                className={`relative py-4 px-3 text-center transition-[color,opacity,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-dark cursor-pointer ${
                  isActive
                    ? 'text-ink-black font-medium'
                    : 'text-muted-taupe hover:text-espresso'
                }`}
              >
                <span className="block text-xs tracking-[0.18em] uppercase opacity-75 mb-1">
                  {chapter.number}
                </span>
                <span className="font-editorial text-lg sm:text-xl tracking-normal block">
                  {chapter.tabLabel}
                </span>
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0 inset-x-4 h-[1.5px] bg-ink-black transition-[opacity,transform] duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Hairline Editorial Spread */}
        <div
          id={`panel-${activeChapter.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeChapter.id}`}
          className="pt-2 transition-opacity duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
            {/* Left Column: Material Story */}
            <div className="md:col-span-7 space-y-4">
              <p className="text-xs uppercase tracking-[0.18em] text-cocoa font-medium">
                {activeChapter.number} · {activeChapter.provenance}
              </p>

              <h3 className="font-editorial text-2xl sm:text-3xl font-normal tracking-[-0.01em] text-ink-black leading-snug">
                {activeChapter.title}
              </h3>

              <p className="font-editorial italic text-lg sm:text-xl text-espresso/90 leading-relaxed">
                {activeChapter.headline}
              </p>

              <p className="text-[15px] sm:text-base text-ink-black/80 leading-[1.65]">
                {activeChapter.description}
              </p>
            </div>

            {/* Right Column: Restrained Workbench Ledger */}
            <div className="md:col-span-5 bg-bone/50 border border-cocoa/15 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-cocoa/15 pb-3">
                <span className="text-xs uppercase tracking-[0.18em] text-espresso font-medium">
                  At the Bench
                </span>
                <span className="text-xs uppercase tracking-[0.16em] text-muted-taupe">
                  Drop 001
                </span>
              </div>

              <ul className="divide-y divide-cocoa/10 text-sm text-ink-black/85">
                {activeChapter.notes.map((note, idx) => (
                  <li key={idx} className="py-3 first:pt-1 last:pb-1 leading-relaxed">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
