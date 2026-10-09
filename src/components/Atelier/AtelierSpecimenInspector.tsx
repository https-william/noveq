'use client';

import React, { useState } from 'react';
import { Layers, ShieldCheck, Sparkles, Compass, Check } from 'lucide-react';

interface Specimen {
  id: string;
  number: string;
  title: string;
  shortLabel: string;
  metric: string;
  headline: string;
  description: string;
  benchNotes: string[];
  provenance: string;
}

const SPECIMENS: Specimen[] = [
  {
    id: 'hide',
    number: '01',
    title: 'Vegetable-Tanned Cowhide',
    shortLabel: '2.2mm Full-Grain Hide',
    metric: '2.2 mm Gauge',
    headline: 'Thick, breathable calfskin conditioned with natural beeswax.',
    description:
      'We reject paper-thin bonded leathers in favor of substantial 2.2mm vegetable-tanned hides sourced from Northern Nigeria. Tanned slowly in plant tannins and natural oils, the leather breathes freely and softens to your unique foot contours across 2-3 wears with zero break-in friction.',
    benchNotes: [
      'Full-grain aniline surface preserving natural pore texture',
      'Naturally conditioned with beeswax and organic tallow',
      'Forms a personalized patina that deepens with sun and stride',
    ],
    provenance: 'Northern Nigeria / Vegetable Tannery',
  },
  {
    id: 'edge',
    number: '02',
    title: '45° Hand-Beveled Sole Edge',
    shortLabel: '45° Beveled Sole',
    metric: 'Hand-Rasp Shaved',
    headline: 'Sculpted edge profile hot-burnished with carnauba wax.',
    description:
      'Every sole profile is hand-shaped with custom rasp blades at our Lagos workbench. Shaving the outer perimeter at a precise 45-degree angle eliminates bulky silhouette lines and creates a light, floating shadowline beneath the footbed while resisting curb scuffs.',
    benchNotes: [
      'Individually hand-skived and rasped by master artisans',
      'Hot-iron burnished with organic carnauba wax seal',
      'Weather-sealed against Lagos rain and asphalt grit',
    ],
    provenance: 'Lagos Atelier / Benchcraft Workbench',
  },
  {
    id: 'arch',
    number: '03',
    title: 'Tempered Ergonomic Arch',
    shortLabel: '8mm Tempered Arch',
    metric: '8 mm Lift Slope',
    headline: 'Modern walking balance allowing natural toe splay.',
    description:
      'Traditional flat slippers slap against heels and fatigue insteps over long walks. We re-engineered the pam sole with an 8mm tempered incline and sculpted instep curve that cushions downward foot strike across sun-baked asphalt and polished marble alike.',
    benchNotes: [
      'Contoured instep support tailored for female foot ergonomics',
      'Dual-density high-resilience insole cushioning',
      'Firm outer rim preventing lateral ankle roll',
    ],
    provenance: 'Anatomical Last Development / Lagos',
  },
  {
    id: 'hardware',
    number: '04',
    title: 'Cast Solid Brass Hardware',
    shortLabel: 'Cast Solid Brass',
    metric: 'Solid Architectural Brass',
    headline: 'Hand-buffed statement metalwork anchored into full-grain straps.',
    description:
      'On The Ring silhouette, custom cast solid brass anchors the architectural vamp strap. Hand-buffed to a muted satin luster, each piece carries real tactile weight and will never flake, peel, or rust, aging alongside the leather with quiet permanence.',
    benchNotes: [
      'Solid non-ferrous brass casting with hand-buffed luster',
      'Heavy-duty dual-rivet mechanical strap anchorage',
      'Tarnish-resistant natural seal for humid tropical wear',
    ],
    provenance: 'Artisan Metal Foundry / Hand-Buffed',
  },
];

export function AtelierSpecimenInspector() {
  const [activeId, setActiveId] = useState<string>(SPECIMENS[0].id);

  const activeSpecimen = SPECIMENS.find((s) => s.id === activeId) || SPECIMENS[0];

  return (
    <section
      aria-label="Atelier Leather & Materiality Inspector"
      className="py-16 sm:py-20 bg-warm-white border-b border-cocoa/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Eyebrow & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-cocoa/15 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-[0.2em] text-cocoa font-semibold">
              <Compass className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Tactile Anatomy // Materiality</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink-black font-serif">
              The Atelier Specimen Bench
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-ink-black/75 max-w-xl leading-relaxed">
              Explore the physical components of Drop 001. Four architectural elements engineered for lasting comfort and tactile distinction.
            </p>
          </div>

          <div className="text-[11px] font-mono uppercase tracking-widest text-muted-taupe shrink-0 hidden md:block">
            <span>6°31&apos; N, 3°23&apos; E • LAGOS ATELIER</span>
          </div>
        </div>

        {/* Specimen Navigation Pills (Tabs) */}
        <div
          role="tablist"
          aria-label="Footwear craft specimens"
          className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3"
        >
          {SPECIMENS.map((specimen) => {
            const isActive = specimen.id === activeId;
            return (
              <button
                key={specimen.id}
                role="tab"
                id={`tab-${specimen.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${specimen.id}`}
                type="button"
                onClick={() => setActiveId(specimen.id)}
                className={`p-3.5 sm:p-4 rounded-xs border text-left transition-all duration-160 ease-out active:scale-[0.98] focus-dark ${
                  isActive
                    ? 'bg-espresso text-warm-white border-espresso shadow-apple-sm ring-1 ring-espresso'
                    : 'bg-bone/60 text-ink-black border-cocoa/25 hover:border-cocoa/60 hover:bg-bone'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                  <span className={isActive ? 'text-warm-white/70 font-semibold' : 'text-cocoa font-medium'}>
                    {specimen.number} // SPEC
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-xs ${
                      isActive ? 'bg-warm-white/15 text-warm-white' : 'bg-warm-white border border-cocoa/20 text-muted-taupe'
                    }`}
                  >
                    {specimen.metric}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-semibold truncate">
                  {specimen.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Specimen Detail Card (Zero-Layout-Shift Disclosure) */}
        <div
          id={`panel-${activeSpecimen.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeSpecimen.id}`}
          className="p-6 sm:p-10 bg-bone border border-cocoa/25 rounded-xs shadow-apple-sm transition-opacity duration-200"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Core Narrative */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-widest text-cocoa font-bold">
                  {activeSpecimen.number} • SPECIFICATION
                </span>
                <span className="w-1 h-1 rounded-full bg-cocoa/50" />
                <span className="text-xs font-mono text-muted-taupe">
                  {activeSpecimen.provenance}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-ink-black font-serif">
                {activeSpecimen.headline}
              </h3>

              <p className="text-xs sm:text-sm text-ink-black/85 leading-relaxed">
                {activeSpecimen.description}
              </p>
            </div>

            {/* Right Column: Workbench Notes Blueprint */}
            <div className="lg:col-span-5 bg-warm-white/90 border border-cocoa/20 rounded-xs p-5 sm:p-6 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-cocoa/15 pb-2.5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-espresso">
                  <Layers className="w-3.5 h-3.5 text-cocoa" aria-hidden="true" />
                  <span>Workbench Notes</span>
                </div>
                <span className="text-[10px] font-mono text-muted-taupe">VERIFIED</span>
              </div>

              <ul className="space-y-2.5 text-xs text-ink-black/80">
                {activeSpecimen.benchNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 leading-snug">
                    <Check className="w-3.5 h-3.5 text-cocoa shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 border-t border-cocoa/10 flex items-center justify-between text-[11px] text-muted-taupe">
                <span>Standard: Zero synthetic fillers</span>
                <span className="font-medium text-cocoa">100% Genuine Hide</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
