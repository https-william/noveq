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
    tabLabel: 'The Leather',
    title: 'Soft, Natural Nigerian Leather',
    headline: 'Thick enough to hold its clean line, soft enough to feel gentle from your first wear.',
    description:
      'We choose breathable natural leather finished with plant oils instead of plastic coatings. It never feels stiff or papery, and gently shapes itself to your foot across your first two or three outings.',
    notes: [
      'Breathable natural grain without plastic shine',
      'Conditioned by hand so straps stay soft and supple',
      'Deepens into a richer tone with time and movement',
    ],
    provenance: 'Selected Local Leather',
  },
  {
    id: 'edge',
    number: '02',
    tabLabel: 'The Edges',
    title: 'Smooth, Hand-Sealed Edges',
    headline: 'Shaped and smoothed by hand so nothing rubs or pinches bare skin.',
    description:
      'Every strap and sole border is trimmed cleanly and sealed with warm natural wax at our Lagos workbench. The result is a dark, smooth finish built to stand up to humid streets and everyday wear.',
    notes: [
      'Rounded gently by hand along every strap edge',
      'Sealed cleanly to keep out moisture and city dust',
      'Built for smooth walking on asphalt, tile, and stone',
    ],
    provenance: 'Lagos Workbench',
  },
  {
    id: 'arch',
    number: '03',
    tabLabel: 'The Comfort',
    title: 'Gentle Cushioned Support',
    headline: 'A subtle cushioned lift under the heel so long days out stay effortless.',
    description:
      'Flat slides often tire the arch after an hour on hard ground. We tucked soft layered padding beneath the leather footbed with a quiet lift at the heel, easing pressure with every step.',
    notes: [
      'Gently shaped under the arch for natural balance',
      'Soft hidden cushioning beneath the smooth leather lining',
      'Steady heel base that stops the sole from slapping',
    ],
    provenance: 'Everyday Fit Study',
  },
  {
    id: 'hardware',
    number: '04',
    tabLabel: 'The Brass',
    title: 'Solid Brass Hardware',
    headline: 'Weighted solid brass with a quiet satin glow that never flakes or peels.',
    description:
      'On The Ring, solid brass anchors the sweeping top strap cleanly. Because it is solid metal rather than thin paint or plating, it keeps its calm golden warmth season after season.',
    notes: [
      'Weighted solid brass finished with a soft sheen',
      'Secured cleanly through the strap for lasting strength',
      'Easy to wipe bright with a dry cloth in coastal air',
    ],
    provenance: 'Small-Batch Metalwork',
  },
];

export function AtelierSpecimenInspector() {
  const [activeId, setActiveId] = useState<string>(CHAPTERS[0].id);
  const activeChapter = CHAPTERS.find((c) => c.id === activeId) || CHAPTERS[0];

  return (
    <section
      aria-label="Workshop Materials and Craft"
      className="py-20 sm:py-28 bg-warm-white border-b border-cocoa/15"
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8 space-y-12">
        {/* Centered Heading */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block">
            Inside Drop 001
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-[2.75rem] font-normal tracking-[-0.015em] leading-[1.15] text-ink-black text-balance">
            How Each Pair Is Made
          </h2>
          <p className="text-[15px] sm:text-base text-muted-taupe leading-relaxed text-pretty">
            Four quiet details go into every pair, each cut and finished by hand in our Lagos workshop.
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
                className={`press-tactile relative py-4 px-3 text-center transition-[color,opacity,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] focus-dark cursor-pointer ${
                  isActive
                    ? 'text-ink-black font-medium'
                    : 'text-muted-taupe hover:text-espresso'
                }`}
              >
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
                {activeChapter.provenance}
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

            {/* Right Column: Double-Bezel Workbench Ledger */}
            <div className="md:col-span-5 p-1.5 rounded-[24px] bg-bone/80 border border-cocoa/12">
              <div className="bg-warm-white border border-cocoa/10 rounded-[18px] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-cocoa/12 pb-3">
                  <span className="text-xs font-medium text-espresso">
                    At the Bench
                  </span>
                  <span className="text-xs font-mono text-muted-taupe">
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
      </div>
    </section>
  );
}
