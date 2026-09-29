'use client';

import { useState, useMemo, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Check,
  Sparkles,
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
 * Editorial Campaign Highlights
 * Highlighting The Ring and The Weave with outcome-driven persuasion (/wolf & /clarity)
 */
const CAMPAIGN_HIGHLIGHTS = [
  {
    id: 'the-ring',
    name: 'The Ring Slide Pam',
    eyebrow: 'Modern. Chic. Refined.',
    tagline: 'Simple details. Bigger impact.',
    slug: 'the-ring-slide-pam',
    posterImage: '/images/campaign/the-ring-campaign-poster.png',
    editorialImage: '/images/models/the-ring-editorial-spec.jpg',
    hook: '“You know those outfits where the clothes are simple but the footwear completely changes the look? That’s what we designed this for.”',
    featureOutcome: [
      {
        feature: 'Contoured Gold Statement Ring',
        benefit: 'Distinctive focal anchor with zero instep pressure',
        outcome: 'Elevates casual denim or neutral linens into a fashion-forward ensemble.',
      },
      {
        feature: 'Tempered 12mm Low Heel',
        benefit: 'Adds subtle posture elevation without high heel fatigue',
        outcome: 'Walk with quiet elegance and all-day comfort across Lagos streets.',
      },
      {
        feature: 'Full-Grain Nigerian Calfskin',
        benefit: 'Adapts and relaxes to your natural foot width over wears',
        outcome: 'A personalized fit that deepens with a rich, lasting leather patina.',
      },
    ],
    colorways: ['Warm Tan', 'Rich Burgundy', 'Deep Noir', 'Off White'],
    ctaLabel: 'Explore The Ring',
  },
  {
    id: 'the-weave',
    name: 'The Weave Slide Pam',
    eyebrow: 'Now in More Colours',
    tagline: 'Textured finish. Timeless presence.',
    slug: 'the-weave-slide-pam',
    posterImage: '/images/campaign/the-weave-campaign-poster.png',
    editorialImage: '/images/models/the-weave-editorial-spec.jpg',
    hook: '“Move from product to outcome. Tactile woven leather architecture that brings effortless depth to your daily stride.”',
    featureOutcome: [
      {
        feature: 'Handcrafted Braided Vamp',
        benefit: 'Distributes stride flex naturally across the arch',
        outcome: 'Prevents edge pinching while adding organic textural presence.',
      },
      {
        feature: 'Versatile Palette Expansion',
        benefit: 'Five foundational earth-toned leather shades',
        outcome: 'Seamless pairing with monochromatic, neutral, or tailored wardrobes.',
      },
      {
        feature: 'Hand-Beveled Square Toe Base',
        benefit: 'Contoured base allowing natural anatomical toe splay',
        outcome: 'Balanced ground contact with refined, modern geometric lines.',
      },
    ],
    colorways: ['Black', 'Burgundy', 'Off White', 'Army Green', 'Dark Brown'],
    ctaLabel: 'Explore The Weave',
  },
];

function HomeClientInner() {
  const searchParams = useSearchParams();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [activeCampaignIndex, setActiveCampaignIndex] = useState(0);

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

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setNewsletterLoading(true);
    setNewsletterError(null);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newsletterEmail,
          source: 'homepage_waitlist',
          campaignState,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register.');
      }

      trackEvent('newsletter_signup', {
        location: `homepage_${campaignState}`,
      });
      setNewsletterSubmitted(true);
      setNewsletterEmail('');
    } catch (err: unknown) {
      setNewsletterError(err instanceof Error ? err.message : 'Please check your email and try again.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  const currentCampaign = CAMPAIGN_HIGHLIGHTS[activeCampaignIndex];

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
                    <span className="font-semibold text-oxblood text-warm-white">DROP 001 SOLD OUT</span>
                    <span className="w-1 h-1 rounded-full bg-oxblood" />
                    <span>Register for Drop 002</span>
                  </>
                )}
                {campaignState === 'reveal' && (
                  <>
                    <span className="font-semibold text-warm-white">DROP 001 REVEAL</span>
                    <span className="w-1 h-1 rounded-full bg-muted-taupe-on-dark" />
                    <span>Examine Silhouettes & Craft Details</span>
                  </>
                )}
                {campaignState === 'live' && (
                  <>
                    <span className="font-semibold text-warm-white">DROP 001</span>
                    <span className="w-1 h-1 rounded-full bg-cocoa" />
                    <span>Handcrafted in Nigeria</span>
                  </>
                )}
              </div>

              {/* Editorial Launch Headline */}
              <h1 className="font-rayleigh text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-warm-white leading-[1.02]">
                {campaignState === 'pre-launch' && 'The first release is almost here.'}
                {campaignState === 'sold-out' && 'Ten pairs claimed.'}
                {campaignState === 'reveal' && 'A quiet debut.'}
                {campaignState === 'live' && 'Crafted to move.'}
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-muted-taupe-on-dark max-w-xl font-normal leading-relaxed">
                {campaignState === 'pre-launch' &&
                  'Drop 001 enters final artisan finishing in Nigeria. Ten pairs of contemporary leather footwear, made for everyday movement.'}
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
                <span>Handcrafted in Nigeria</span>
                <span>•</span>
                <span>Contemporary Leather Footwear</span>
                <span>•</span>
                <span>Full-Grain Leather</span>
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
              <div className="relative aspect-[3/4] sm:aspect-[4/3] lg:aspect-[3/4] bg-espresso/60 border border-cocoa/40 rounded-xs overflow-hidden shadow-2xl group">
                <Image
                  src="/images/models/the-twist-model.jpg"
                  alt="NOVEQ contemporary leather footwear on model — Handcrafted in Nigeria"
                  fill
                  priority
                  quality={90}
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
              <span>View All Silhouettes</span>
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
            We began with a staple familiar to every Nigerian closet: the slip-on leather pam. We asked what happens when you treat that familiar form with architectural discipline and vegetable-tanned hides.
          </p>
        </div>
      </ScrollReveal>

      {/* ── 4. BRAND STORY MINI-EDITORIAL BLOCK ── */}
      <section className="py-20 sm:py-28 bg-bone border-b border-cocoa/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative aspect-[4/3] bg-warm-white border border-cocoa/30 rounded-xs overflow-hidden shadow-md group">
                <Image
                  src="/images/editorial/artisan-workshop.jpg"
                  alt="NOVEQ artisan partner in Lagos hand-cutting and shaping full-grain leather pams at his workbench"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
              <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block">
                01 / Atelier Origin
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink-black leading-tight">
                Handcrafted in Nigeria. Built for modern movement.
              </h2>
              <div className="space-y-4 text-xs sm:text-sm text-ink-black/80 leading-relaxed">
                <p>
                  Every pair of NOVEQ footwear is shaped in direct partnership with master artisans in Nigeria. We reject industrial mass assembly in favor of meticulous benchcraft.
                </p>
                <p>
                  We select thick, vegetable-tanned cowhide, shape the asymmetric straps by hand, and temper the sole profile for walking comfort across sun-baked asphalt and polished marble alike.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/story"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-cocoa hover:text-ink-black underline underline-offset-4 focus-dark min-h-[44px]"
                >
                  <span>Read our origin story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. EDITORIAL CAMPAIGN SHOWCASE (THE RING & THE WEAVE) ──
          Featuring authentic feet-on-model editorial photography and campaign posters.
          Straight-Line Persuasion (/wolf): "Sell the reason to want them" — Feature → Benefit → Lifestyle Outcome. */}
      <section className="py-20 sm:py-28 bg-espresso text-warm-white border-b border-cocoa/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Campaign Copy & Interactive Silhouette Selector */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-taupe-on-dark font-medium block">
                  Campaign Showcase
                </span>
                <span className="text-[11px] font-mono text-muted-taupe-on-dark">
                  0{activeCampaignIndex + 1} / 0{CAMPAIGN_HIGHLIGHTS.length}
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-serif italic text-cocoa">
                  {currentCampaign.eyebrow}
                </span>
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-warm-white leading-tight">
                  {currentCampaign.tagline}
                </h2>
              </div>

              {/* /wolf Straight-Line Outcome Hook */}
              <div className="p-4 bg-ink-black/40 border-l-2 border-cocoa rounded-xs">
                <p className="text-sm sm:text-base text-warm-white/95 font-serif italic leading-relaxed">
                  {currentCampaign.hook}
                </p>
              </div>

              {/* Silhouette Switcher Tabs */}
              <div
                role="tablist"
                aria-label="Campaign silhouettes"
                className="grid grid-cols-2 gap-3 pt-2"
              >
                {CAMPAIGN_HIGHLIGHTS.map((item, idx) => {
                  const isSelected = activeCampaignIndex === idx;
                  return (
                    <button
                      key={item.id}
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setActiveCampaignIndex(idx)}
                      className={`p-3.5 text-left border rounded-xs transition-all duration-200 focus-dark ${
                        isSelected
                          ? 'bg-warm-white text-ink-black border-warm-white shadow-sm ring-1 ring-warm-white'
                          : 'bg-ink-black/40 text-warm-white/80 border-cocoa/40 hover:bg-ink-black/70 hover:border-cocoa/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] uppercase tracking-widest font-mono ${
                          isSelected ? 'text-cocoa font-bold' : 'text-muted-taupe-on-dark'
                        }`}>
                          Silhouette 0{idx + 1}
                        </span>
                        <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'text-cocoa' : 'text-warm-white/50'}`} />
                      </div>
                      <h3 className={`text-xs font-semibold ${
                        isSelected ? 'text-ink-black' : 'text-warm-white'
                      }`}>
                        {item.name}
                      </h3>
                      <p className={`text-[10px] mt-0.5 ${
                        isSelected ? 'text-muted-taupe' : 'text-muted-taupe-on-dark'
                      }`}>
                        {item.eyebrow}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Feature → Benefit → Lifestyle Outcome Cards */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-taupe-on-dark block font-semibold">
                  Considered Design & Daily Fit
                </span>
                {currentCampaign.featureOutcome.map((fo, i) => (
                  <div key={i} className="p-3 bg-ink-black/30 border border-cocoa/30 rounded-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-warm-white">
                        {fo.feature}
                      </span>
                      <span className="text-[10px] text-cocoa font-mono">
                        {fo.benefit}
                      </span>
                    </div>
                    <p className="text-xs text-muted-taupe-on-dark leading-relaxed">
                      {fo.outcome}
                    </p>
                  </div>
                ))}
              </div>

              {/* Colorway Pills & CTA */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-cocoa/30">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-taupe-on-dark block">
                    Curated Colours
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentCampaign.colorways.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 bg-ink-black/60 border border-cocoa/30 text-[10px] text-warm-white rounded-xs"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveCampaignIndex((prev) =>
                        prev === 0 ? CAMPAIGN_HIGHLIGHTS.length - 1 : prev - 1
                      )
                    }
                    className="p-2 border border-cocoa/40 rounded-xs text-muted-taupe-on-dark hover:text-warm-white hover:bg-ink-black/60 transition-colors"
                    aria-label="Previous campaign silhouette"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveCampaignIndex((prev) =>
                        prev === CAMPAIGN_HIGHLIGHTS.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="p-2 border border-cocoa/40 rounded-xs text-muted-taupe-on-dark hover:text-warm-white hover:bg-ink-black/60 transition-colors"
                    aria-label="Next campaign silhouette"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/products/${currentCampaign.slug}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-warm-white text-ink-black text-xs uppercase tracking-[0.2em] font-semibold hover:bg-bone transition-colors rounded-xs focus-dark shrink-0 min-h-[44px]"
                  >
                    <span>{currentCampaign.ctaLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Dual Editorial Visuals (Poster & Feet-On-Model) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Poster Asset */}
                <div className="relative aspect-[3/4] bg-ink-black border border-cocoa/30 rounded-xs overflow-hidden shadow-lg group">
                  <Image
                    src={currentCampaign.posterImage}
                    alt={`NOVEQ official campaign poster — ${currentCampaign.name}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />
                  <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-ink-black/80 backdrop-blur-xs border border-cocoa/40 text-[9px] uppercase tracking-wider text-warm-white rounded-xs">
                    Campaign Poster
                  </span>
                </div>

                {/* Editorial Model Spec Asset */}
                <div className="relative aspect-[3/4] bg-ink-black border border-cocoa/30 rounded-xs overflow-hidden shadow-lg group">
                  <Image
                    src={currentCampaign.editorialImage}
                    alt={`NOVEQ feet-on-model editorial photography — ${currentCampaign.name}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />
                  <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-ink-black/80 backdrop-blur-xs border border-cocoa/40 text-[9px] uppercase tracking-wider text-warm-white rounded-xs">
                    Feet on Model
                  </span>
                </div>
              </div>

              <div className="p-3 bg-ink-black/40 border border-cocoa/30 rounded-xs flex items-center justify-between text-xs text-muted-taupe-on-dark">
                <span>Natural stride testing on Lagos stone pavement</span>
                <span className="font-mono text-warm-white font-semibold">Drop 001 Original</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. SOCIAL PROOF ARCHITECTURE ──
          Curated Instagram strip + Launch-honest Day 1 invite. */}
      <SocialProofSection />

      {/* ── 8. NEWSLETTER / LAUNCH LIST / WAITLIST ──
          Persists to /api/newsletter and data/subscribers.json for drop retention. */}
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
                disabled={newsletterLoading}
                className="px-6 py-3 bg-ink-black text-warm-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-espresso transition-colors rounded-xs focus-dark min-h-[44px] active:scale-[0.98] disabled:opacity-50"
              >
                {newsletterLoading
                  ? 'Saving...'
                  : campaignState === 'sold-out'
                  ? 'Register'
                  : 'Join List'}
              </button>
            </form>
          )}

          {newsletterError && (
            <p className="text-xs text-oxblood">{newsletterError}</p>
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
