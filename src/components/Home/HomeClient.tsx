'use client';

import { useState, useMemo, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Check,
  Box,
  Sparkles,
  ShieldCheck,
  Camera,
  Layers,
  FileText,
  ChevronLeft,
  ChevronRight,
  Clock,
  Archive,
} from 'lucide-react';
import ProductCard from '@/components/Product/ProductCard';
import { SocialProofSection } from '@/components/SocialProof/SocialProofSection';
import { ScrollReveal } from '@/components/Editorial/ScrollReveal';
import { DROP_001_PRODUCTS } from '@/data/products';
import { SITE_SETTINGS } from '@/config/siteSettings';
import { CampaignState } from '@/types/content';
import { trackEvent } from '@/lib/analytics';

/**
 * Packaging Artifact Inspection Definitions
 * Sequential unboxing layers: Kraft Box → Archival Tissue → Care Card → Shopping Bag
 */
const PACKAGING_LAYERS = [
  {
    id: 'box',
    stepNumber: '01',
    name: 'Slim Kraft Box',
    shortRole: 'Sturdy brown board',
    material: '450gsm unbleached natural kraft board',
    dimensions: '330mm × 210mm × 105mm',
    description:
      'Rigid construction engineered specifically for slip-in footwear. Debossed with the lowercase noveq wordmark on the lid. Sized slim to eliminate excess volume while keeping the slides flat and structured in transit.',
    tactileNote: 'Raw paper grain texture, zero chemical gloss, fully biodegradable.',
    badge: 'Primary Shell',
    icon: Box,
  },
  {
    id: 'tissue',
    stepNumber: '02',
    name: 'Archival Tissue Wrap',
    shortRole: 'Protective cushioning',
    material: '28gsm acid-free unbleached tissue',
    dimensions: 'Double-fold protective cocoon',
    description:
      'Each pair is hand-wrapped in neutral archival tissue to guard the vegetable-tanned grain against scuffs or environmental humidity during transit, sealed with a minimal geometric seal.',
    tactileNote: 'Crisp hand-fold, breathable fiber weave preventing moisture buildup.',
    badge: 'Interior Protection',
    icon: Layers,
  },
  {
    id: 'card',
    stepNumber: '03',
    name: 'Thank-You & Care Card',
    shortRole: 'Material upkeep notes',
    material: '350gsm warm cotton cardstock',
    dimensions: 'A6 debossed artisan card',
    description:
      'A personal note from the founding team alongside concise leather care instructions: routine dusting, rain response, and beeswax conditioning intervals tailored to Nigerian full-grain hides.',
    tactileNote: 'Debossed typographic impression with a handwritten pair serial number.',
    badge: 'Artisan Record',
    icon: FileText,
  },
  {
    id: 'bag',
    stepNumber: '04',
    name: 'Branded Shopping Bag',
    shortRole: 'Hand-delivered carry',
    material: 'Reinforced kraft with twisted cotton handles',
    dimensions: 'Custom vertical carrier',
    description:
      'Created for discreet, elevated presentation for direct hand-deliveries across Lagos and beyond. Understated ink-black imprint on warm kraft tone with reinforced base gusset.',
    tactileNote: 'Firm twisted-cotton rope handles that rest comfortably in hand.',
    badge: 'Handover Finish',
    icon: ShieldCheck,
  },
];

function HomeClientInner() {
  const searchParams = useSearchParams();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [activePackagingIndex, setActivePackagingIndex] = useState(0);

  // Dynamic campaign state: URL query param (?state=pre-launch | sold-out | reveal | live)
  // allows effortless testing & previewing, falling back to SITE_SETTINGS config.
  const campaignState: CampaignState = useMemo(() => {
    const queryState = searchParams?.get('state');
    if (
      queryState === 'pre-launch' ||
      queryState === 'sold-out' ||
      queryState === 'reveal' ||
      queryState === 'live'
    ) {
      return queryState as CampaignState;
    }
    return (SITE_SETTINGS.campaign?.state as CampaignState) || 'live';
  }, [searchParams]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      trackEvent('newsletter_signup', {
        location: `homepage_${campaignState}`,
      });
      setNewsletterSubmitted(true);
      setNewsletterEmail('');
    }
  };

  const currentPackagingLayer = PACKAGING_LAYERS[activePackagingIndex];

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── 1. HERO SECTION (SWAPPABLE LAUNCH SEQUENCE STATES) ──
          Driven by SITE_SETTINGS.campaign.state or ?state= URL preview.
          States: 'live' | 'pre-launch' | 'sold-out' | 'reveal' */}
      <section className="bg-ink-black text-warm-white border-b border-cocoa/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Contextual Launch Copy */}
            <div className="lg:col-span-7 space-y-6">
              {/* Dynamic Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-espresso border border-cocoa/40 rounded-xs text-[11px] uppercase tracking-[0.2em] text-muted-taupe-on-dark">
                {campaignState === 'pre-launch' && (
                  <>
                    <span className="font-semibold text-warm-white">PRE-LAUNCH PREVIEW</span>
                    <span className="w-1 h-1 rounded-full bg-muted-taupe-on-dark" />
                    <span>Drop 001 Finishing in Atelier</span>
                  </>
                )}
                {campaignState === 'sold-out' && (
                  <>
                    <span className="font-semibold text-warm-white">DROP 001 ALLOCATED</span>
                    <span className="w-1 h-1 rounded-full bg-muted-taupe-on-dark" />
                    <span>Drop 002 in Craft Production</span>
                  </>
                )}
                {campaignState === 'reveal' && (
                  <>
                    <span className="font-semibold text-warm-white">DROP 001 UNCOVERED</span>
                    <span className="w-1 h-1 rounded-full bg-muted-taupe-on-dark" />
                    <span>First Look: 10 Pairs</span>
                  </>
                )}
                {campaignState === 'live' && (
                  <>
                    <span className="font-semibold text-warm-white">DROP 001</span>
                    <span className="w-1 h-1 rounded-full bg-muted-taupe-on-dark" />
                    <span>10 Pairs Initial Release</span>
                  </>
                )}
              </div>

              {/* Dynamic Headline */}
              <h1 className="font-rayleigh text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-warm-white leading-[1.02]">
                {campaignState === 'pre-launch' && 'The first release is almost here.'}
                {campaignState === 'sold-out' && 'Ten pairs claimed.'}
                {campaignState === 'reveal' && 'A quiet debut.'}
                {campaignState === 'live' && 'Crafted to move.'}
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-muted-taupe-on-dark max-w-xl font-normal leading-relaxed">
                {campaignState === 'pre-launch' &&
                  'Drop 001 enters final artisan finishing in Lagos. Ten pairs of contemporary leather footwear, made for everyday movement.'}
                {campaignState === 'sold-out' &&
                  'All ten pairs of Drop 001 have been allocated. Join the private register to receive priority access to Drop 002 when leather tempering completes.'}
                {campaignState === 'reveal' &&
                  'Explore the silhouettes, asymmetric straps, and full-grain Nigerian hides before the purchase window opens.'}
                {campaignState === 'live' &&
                  'Contemporary leather footwear, thoughtfully made for everyday movement.'}
              </p>

              {/* Contextual Action CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                {campaignState === 'live' && (
                  <>
                    <Link
                      href="/shop"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-warm-white text-ink-black text-xs uppercase tracking-[0.2em] font-semibold hover:bg-bone transition-colors rounded-xs focus-dark min-h-[48px] active:scale-[0.99]"
                    >
                      <span>Explore Drop 001</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/story"
                      className="inline-flex items-center justify-center gap-2 px-6 py-4 border border-warm-white/30 text-warm-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-warm-white/10 transition-colors rounded-xs focus-dark min-h-[48px]"
                    >
                      <span>Read Our Story</span>
                    </Link>
                  </>
                )}

                {campaignState === 'pre-launch' && (
                  <>
                    <a
                      href="#launch-access"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-warm-white text-ink-black text-xs uppercase tracking-[0.2em] font-semibold hover:bg-bone transition-colors rounded-xs focus-dark min-h-[48px] active:scale-[0.99]"
                    >
                      <span>Join Launch List</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <Link
                      href="/story"
                      className="inline-flex items-center justify-center gap-2 px-6 py-4 border border-warm-white/30 text-warm-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-warm-white/10 transition-colors rounded-xs focus-dark min-h-[48px]"
                    >
                      <span>Read Our Story</span>
                    </Link>
                  </>
                )}

                {campaignState === 'sold-out' && (
                  <>
                    <a
                      href="#launch-access"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-warm-white text-ink-black text-xs uppercase tracking-[0.2em] font-semibold hover:bg-bone transition-colors rounded-xs focus-dark min-h-[48px] active:scale-[0.99]"
                    >
                      <span>Join Drop 002 Waitlist</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <Link
                      href="/drop-001"
                      className="inline-flex items-center justify-center gap-2 px-6 py-4 border border-warm-white/30 text-warm-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-warm-white/10 transition-colors rounded-xs focus-dark min-h-[48px]"
                    >
                      <span>View Drop 001 Archive</span>
                    </Link>
                  </>
                )}

                {campaignState === 'reveal' && (
                  <>
                    <a
                      href="#drop-001-grid"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-warm-white text-ink-black text-xs uppercase tracking-[0.2em] font-semibold hover:bg-bone transition-colors rounded-xs focus-dark min-h-[48px] active:scale-[0.99]"
                    >
                      <span>Preview Silhouettes</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <a
                      href="#launch-access"
                      className="inline-flex items-center justify-center gap-2 px-6 py-4 border border-warm-white/30 text-warm-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-warm-white/10 transition-colors rounded-xs focus-dark min-h-[48px]"
                    >
                      <span>Get Private Access</span>
                    </a>
                  </>
                )}
              </div>

              {/* Provenance Footer Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-muted-taupe-on-dark font-mono">
                <span>Handmade in Lagos</span>
                <span>•</span>
                <span>Full-Grain Nigerian Leather</span>
                {campaignState === 'pre-launch' && (
                  <>
                    <span>•</span>
                    <span className="text-warm-white font-medium">
                      Release: {SITE_SETTINGS.campaign?.preLaunchDateText || 'October 2026'}
                    </span>
                  </>
                )}
                {campaignState === 'sold-out' && (
                  <>
                    <span>•</span>
                    <span className="text-warm-white font-medium">10/10 Pairs Claimed</span>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Hero Editorial Visual */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5] bg-espresso/60 border border-cocoa/40 rounded-xs overflow-hidden shadow-2xl group">
                <Image
                  src="/images/editorial/campaign-model.jpg"
                  alt="NOVEQ high-fashion editorial campaign — Nigerian model wearing handcrafted leather pams in sunlit Lagos atelier"
                  fill
                  priority
                  loading="eager"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 650px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* State-specific subtle visual overlay pill */}
                {campaignState === 'pre-launch' && (
                  <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1 bg-ink-black/90 backdrop-blur-xs border border-cocoa/40 text-[10px] uppercase tracking-widest text-warm-white rounded-xs">
                    <Clock className="w-3 h-3 text-muted-taupe-on-dark" />
                    <span>In Final Assembly</span>
                  </div>
                )}
                {campaignState === 'sold-out' && (
                  <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1 bg-oxblood/90 backdrop-blur-xs border border-oxblood text-[10px] uppercase tracking-widest text-warm-white rounded-xs font-semibold">
                    <Archive className="w-3 h-3 text-warm-white" />
                    <span>Archive Piece · Sold Out</span>
                  </div>
                )}
                {campaignState === 'reveal' && (
                  <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1 bg-ink-black/90 backdrop-blur-xs border border-cocoa/40 text-[10px] uppercase tracking-widest text-warm-white rounded-xs">
                    <Sparkles className="w-3 h-3 text-muted-taupe-on-dark" />
                    <span>Preview Gallery</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. FEATURED DROP 001 SECTION ──
          Preview of the 10-pair initial run with clear stock signals */}
      <section id="drop-001-grid" className="py-20 sm:py-28 bg-bone border-b border-cocoa/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block mb-2">
                Launch Release
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink-black">
                Drop 001 — The First Ten Pairs
              </h2>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-espresso hover:text-ink-black underline underline-offset-4 focus-dark min-h-[44px]"
            >
              <span>View All 10 Pairs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {DROP_001_PRODUCTS.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. RESTRAINED EDITORIAL ACCENT PHRASE INTERLUDE ──
          A quiet typographic moment using Instrument Serif between catalog and detail deep-dive. */}
      <ScrollReveal className="py-16 sm:py-24 bg-warm-white border-b border-cocoa/20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-[11px] uppercase tracking-[0.25em] text-cocoa font-medium block">
            The NOVEQ Perspective
          </span>
          <blockquote className="font-serif text-3xl sm:text-5xl lg:text-6xl text-espresso font-normal italic tracking-tight leading-tight">
            “Same purpose. A new perspective.”
          </blockquote>
          <p className="text-xs sm:text-sm text-muted-taupe max-w-lg mx-auto leading-relaxed pt-2">
            Footwear conceived without ornament — where proportion, hide selection, and hand-beveled edges speak for themselves.
          </p>
        </div>
      </ScrollReveal>

      {/* ── 4. SIGNATURE DETAIL / VALUE MOMENT ──
          Editorial deep-dive on "The Cut" strap geometry with scroll reveal */}
      <ScrollReveal className="py-20 sm:py-28 bg-bone border-b border-cocoa/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Detail Close-Up Macro Image */}
            <div className="lg:col-span-6">
              <div className="relative aspect-[4/3] bg-espresso/40 border border-cocoa/30 rounded-xs overflow-hidden shadow-lg group">
                <Image
                  src="/images/products/the-twist.jpg"
                  alt="NOVEQ The Twist sculptural full-grain leather texture, hand-beveled edge finish, and artisan stitch"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            </div>

            {/* Right: Architectural Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-semibold block">
                Signature Detail
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl text-espresso font-normal italic leading-snug">
                Asymmetric Instep Geometry
              </h2>

              <h3 className="text-xl font-bold tracking-tight text-ink-black">
                The Twist — Engineered For Natural Walking Stride
              </h3>

              <p className="text-sm text-ink-black/80 font-normal leading-relaxed">
                Traditional slide slippers constrict across the instep during forward stride. For{' '}
                <span className="font-medium">The Twist Slide Pam</span>, our master shoemaker cut the upper strap with an organic sculptural crossing.
              </p>

              <p className="text-sm text-ink-black/80 font-normal leading-relaxed">
                This redistributes walking pressure across the natural arch of the foot, preventing edge pinching and keeping the leather supple through years of daily wear.
              </p>

              <div className="pt-2">
                <Link
                  href="/shop/the-cut-slide-pam-black"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-espresso hover:text-ink-black underline underline-offset-4 focus-dark"
                >
                  <span>Explore The Twist</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── 5. BRAND STORY BLOCK ──
          Short version of NOVEQ story */}
      <ScrollReveal className="py-20 sm:py-28 bg-warm-white border-b border-cocoa/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
              <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block">
                The NOVEQ Foundation
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink-black">
                Footwear designed around quiet confidence.
              </h2>

              <p className="text-sm sm:text-base text-ink-black/85 leading-relaxed font-normal">
                NOVEQ was founded to make familiar leather footwear considered, modern, and enduring. We begin with women’s leather pams — stripped of loud logos, plastic laminates, and artificial luxury theatre.
              </p>

              <p className="text-sm sm:text-base text-ink-black/85 leading-relaxed font-normal">
                Every pair in Drop 001 is handmade in limited runs with an artisan shoemaker partner in Nigeria, ensuring complete integrity in materials, stitching, and feel.
              </p>

              <div className="pt-2">
                <Link
                  href="/story"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink-black text-warm-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-espresso transition-colors rounded-xs focus-dark min-h-[44px]"
                >
                  <span>Read Our Full Story</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Authentic Artisan Workshop Documentary Photograph */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="relative aspect-[4/3] bg-espresso/40 border border-cocoa/30 rounded-xs overflow-hidden shadow-lg group">
                <Image
                  src="/images/editorial/artisan-workshop.jpg"
                  alt="Master artisan shoemaker in Lagos workshop hand-stitching vegetable-tanned leather footwear at workbench"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 bg-ink-black/85 backdrop-blur-xs border border-cocoa/40 text-[10px] uppercase tracking-widest text-warm-white rounded-xs">
                  <span>ATELIER ARCHIVE</span>
                  <span className="w-1 h-1 rounded-full bg-muted-taupe-on-dark" />
                  <span>LAGOS, NIGERIA</span>
                </div>
                <div className="absolute bottom-4 right-4 inline-flex items-center px-3 py-1 bg-ink-black/85 backdrop-blur-xs border border-cocoa/40 text-[10px] tracking-wider text-muted-taupe-on-dark rounded-xs">
                  Hand-Beveled & Saddle-Stitched
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── 6. PACKAGING MOMENT (INTERACTIVE SEQUENTIAL UNBOXING INSPECTION) ──
          Allows customer to inspect each unboxing layer:
          01 Kraft Box → 02 Archival Tissue → 03 Care Card → 04 Shopping Bag
          Strictly NO dust bag. Copy verbatim: "Packed with care. Designed to arrive differently." */}
      <section className="py-20 sm:py-28 bg-espresso text-warm-white border-b border-cocoa/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Verbatim Copy & Interactive Layer Inspector */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-taupe-on-dark font-medium block">
                  Unboxing Experience
                </span>
                <span className="text-[11px] font-mono text-muted-taupe-on-dark">
                  Layer {activePackagingIndex + 1} of {PACKAGING_LAYERS.length}
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-warm-white leading-tight">
                Packed with care. Designed to arrive differently.
              </h2>

              <p className="text-sm sm:text-base text-muted-taupe-on-dark leading-relaxed font-normal">
                Your footwear arrives in a custom slim brown kraft box, protected in archival tissue, accompanied by a handwritten thank-you/care card and our branded shopping bag.
              </p>

              {/* Interactive Layer Tabs */}
              <div
                role="tablist"
                aria-label="Unboxing packaging layers"
                className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2"
              >
                {PACKAGING_LAYERS.map((layer, idx) => {
                  const Icon = layer.icon;
                  const isSelected = activePackagingIndex === idx;
                  return (
                    <button
                      key={layer.id}
                      role="tab"
                      id={`packaging-tab-${layer.id}`}
                      aria-selected={isSelected}
                      aria-controls={`packaging-panel-${layer.id}`}
                      onClick={() => setActivePackagingIndex(idx)}
                      className={`p-3 text-left border rounded-xs transition-all duration-200 focus-dark ${
                        isSelected
                          ? 'bg-warm-white text-ink-black border-warm-white shadow-sm ring-1 ring-warm-white'
                          : 'bg-ink-black/40 text-warm-white/80 border-cocoa/40 hover:bg-ink-black/70 hover:border-cocoa/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-cocoa' : 'text-warm-white/70'}`} />
                        <span
                          className={`text-[10px] font-mono ${
                            isSelected ? 'text-cocoa font-bold' : 'text-muted-taupe-on-dark'
                          }`}
                        >
                          {layer.stepNumber}
                        </span>
                      </div>
                      <h3
                        className={`text-xs font-semibold truncate ${
                          isSelected ? 'text-ink-black' : 'text-warm-white'
                        }`}
                      >
                        {layer.name}
                      </h3>
                      <p
                        className={`text-[10px] truncate mt-0.5 ${
                          isSelected ? 'text-muted-taupe' : 'text-muted-taupe-on-dark'
                        }`}
                      >
                        {layer.shortRole}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Sequential Stepper Controls */}
              <div className="flex items-center justify-between pt-1 border-t border-cocoa/30">
                <button
                  type="button"
                  onClick={() =>
                    setActivePackagingIndex((prev) =>
                      prev === 0 ? PACKAGING_LAYERS.length - 1 : prev - 1
                    )
                  }
                  className="inline-flex items-center gap-1.5 text-xs text-muted-taupe-on-dark hover:text-warm-white py-1 focus-dark"
                  aria-label="Inspect previous unboxing layer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous Layer</span>
                </button>
                <div className="flex items-center gap-1.5">
                  {PACKAGING_LAYERS.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-200 ${
                        activePackagingIndex === i
                          ? 'w-6 bg-warm-white'
                          : 'w-1.5 bg-cocoa/50 hover:bg-cocoa'
                      }`}
                      onClick={() => setActivePackagingIndex(i)}
                      role="button"
                      aria-label={`Jump to unboxing layer ${i + 1}`}
                      tabIndex={0}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setActivePackagingIndex((prev) =>
                      prev === PACKAGING_LAYERS.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="inline-flex items-center gap-1.5 text-xs text-muted-taupe-on-dark hover:text-warm-white py-1 focus-dark"
                  aria-label="Inspect next unboxing layer"
                >
                  <span>Next Layer</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Exclusion Disclaimer */}
              <p className="text-xs text-muted-taupe-on-dark/90 italic pt-1">
                * Dust bags are intentionally excluded from Drop 001 to maximize leather grade and fair launch pricing.
              </p>
            </div>

            {/* Right: Active Layer Detail Pane & Inspection Visual */}
            <div className="lg:col-span-6">
              <div
                id={`packaging-panel-${currentPackagingLayer.id}`}
                role="tabpanel"
                aria-labelledby={`packaging-tab-${currentPackagingLayer.id}`}
                className="bg-ink-black/50 border border-cocoa/40 rounded-sm overflow-hidden p-6 sm:p-8 space-y-6 transition-all duration-300"
              >
                {/* Visual Representation */}
                <div className="relative aspect-[16/10] bg-ink-black/60 border border-cocoa/30 rounded-xs overflow-hidden shadow-lg group">
                  <Image
                    src="/images/brand/packaging.jpg"
                    alt={`NOVEQ official luxury unboxing suite — ${currentPackagingLayer.name}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 bg-ink-black/85 backdrop-blur-xs border border-cocoa/40 text-[10px] uppercase tracking-wider text-warm-white rounded-xs">
                    {currentPackagingLayer.badge}
                  </span>
                </div>

                {/* Layer Specifications */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-cocoa/25 pb-2">
                    <h3 className="text-lg font-bold text-warm-white">
                      {currentPackagingLayer.name}
                    </h3>
                    <span className="text-xs font-mono text-muted-taupe-on-dark">
                      Spec #{currentPackagingLayer.stepNumber}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-taupe-on-dark leading-relaxed">
                    {currentPackagingLayer.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-2.5 bg-espresso/60 border border-cocoa/30 rounded-xs">
                      <span className="text-[10px] uppercase tracking-widest text-muted-taupe-on-dark block">
                        Material
                      </span>
                      <span className="text-warm-white font-medium">
                        {currentPackagingLayer.material}
                      </span>
                    </div>
                    <div className="p-2.5 bg-espresso/60 border border-cocoa/30 rounded-xs">
                      <span className="text-[10px] uppercase tracking-widest text-muted-taupe-on-dark block">
                        Dimensions
                      </span>
                      <span className="text-warm-white font-medium">
                        {currentPackagingLayer.dimensions}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-muted-taupe-on-dark/80 italic flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cocoa" />
                    <span>{currentPackagingLayer.tactileNote}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. SOCIAL PROOF ARCHITECTURE ──
          Curated Instagram strip + Launch-honest Day 1 invite. Strictly NO fabricated reviews. */}
      <SocialProofSection />

      {/* ── 8. NEWSLETTER / LAUNCH LIST / WAITLIST ──
          Small, elegant, single email field. Contextual headline based on campaign state. */}
      <section
        id="launch-access"
        className="py-20 sm:py-24 bg-warm-white text-ink-black border-b border-cocoa/20"
      >
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-semibold block">
            {campaignState === 'sold-out' ? 'Drop 002 Register' : 'Private Access'}
          </span>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink-black">
            {campaignState === 'sold-out' ? 'Join the Drop 002 waitlist.' : 'Be first to know.'}
          </h2>

          <p className="text-xs sm:text-sm text-muted-taupe max-w-md mx-auto leading-relaxed">
            {campaignState === 'sold-out'
              ? 'Drop 001 is completely allocated. Leave your email to receive first notification when Drop 002 opens for reservations. No marketing noise.'
              : 'Receive private notifications for Drop 001 releases, restocking alerts, and atelier journal notes. No promotional noise.'}
          </p>

          {newsletterSubmitted ? (
            <div className="p-4 bg-bone border border-cocoa/30 rounded-xs inline-flex items-center gap-2 text-xs text-espresso font-medium">
              <Check className="w-4 h-4 text-cocoa" />
              <span>
                {campaignState === 'sold-out'
                  ? 'You are on the NOVEQ Drop 002 priority waitlist.'
                  : 'You are on the NOVEQ launch list.'}
              </span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address for launch list notifications
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                aria-label="Email address for launch list notifications"
                className="flex-1 px-4 py-3 bg-bone border border-cocoa/30 text-ink-black placeholder:text-muted-taupe text-xs focus:outline-none focus:border-ink-black rounded-xs transition-colors min-h-[44px]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-ink-black text-warm-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-espresso transition-colors rounded-xs focus-dark min-h-[44px] active:scale-[0.98]"
              >
                {campaignState === 'sold-out' ? 'Register' : 'Join List'}
              </button>
            </form>
          )}

          <p className="text-[11px] text-muted-taupe">
            Leather pams, refined for everyday wear.
          </p>
        </div>
      </section>
    </div>
  );
}

export default function HomeClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink-black" />}>
      <HomeClientInner />
    </Suspense>
  );
}
