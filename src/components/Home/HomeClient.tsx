'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Check,
  Sparkles,
  Clock,
  Archive,
} from 'lucide-react';
import ProductCard from '@/components/Product/ProductCard';
import { SocialProofSection } from '@/components/SocialProof/SocialProofSection';
import { ScrollReveal } from '@/components/Editorial/ScrollReveal';
import { DROP_001_PRODUCTS } from '@/data/products';
import { Product } from '@/types/commerce';
import { SITE_SETTINGS } from '@/config/siteSettings';
import { CampaignState } from '@/types/content';
import { trackEvent } from '@/lib/analytics';

interface HomeClientProps {
  initialProducts?: Product[];
}

function HomeClientInner({ initialProducts }: HomeClientProps) {
  const [products, setProducts] = useState<Product[]>(
    initialProducts && initialProducts.length > 0 ? initialProducts : DROP_001_PRODUCTS
  );

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(() => {});
  }, []);

  const ringProduct = products.find((p) => p.slug === 'the-ring-slide-pam') || products[0];
  const weaveProduct = products.find((p) => p.slug === 'the-weave-slide-pam') || products[1];
  const twistProduct = products.find((p) => p.slug === 'the-twist-slide-pam') || products[2];

  const formattedRingPrice = ringProduct
    ? new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: ringProduct.currency,
        maximumFractionDigits: 0,
      }).format(ringProduct.price)
    : '₦25,000';

  const formattedWeavePrice = weaveProduct
    ? new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: weaveProduct.currency,
        maximumFractionDigits: 0,
      }).format(weaveProduct.price)
    : '₦20,000';

  const formattedTwistPrice = twistProduct
    ? new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: twistProduct.currency,
        maximumFractionDigits: 0,
      }).format(twistProduct.price)
    : '₦25,000';

  const searchParams = useSearchParams();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  // Dynamic campaign state: URL query param (?state=pre-launch | sold-out | reveal | live)
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── 1. HERO SECTION (EDITORIAL LUXURY AESTHETIC + REVERTED HERO COPY) ── */}
      <section className="relative bg-ink-black text-warm-white border-b border-cocoa/30 overflow-hidden design-grid-dark">
        {/* Giant Background Shape with Apple 180° Shadow */}
        <div
          aria-hidden="true"
          className="absolute -top-32 right-1/4 sm:right-1/3 w-[460px] h-[460px] sm:w-[680px] sm:h-[680px] rounded-full bg-radial from-cocoa/30 via-espresso/45 to-transparent blur-3xl shadow-apple-xl animate-subtle-breath pointer-events-none"
        />

        {/* Ambient Realistic Field Lighting */}
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-radial from-oxblood/15 to-transparent blur-3xl pointer-events-none"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Contextual Launch Copy (Reverted to Original) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Dynamic Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-espresso/90 backdrop-blur-xs border border-cocoa/40 rounded-xs text-[11px] uppercase tracking-[0.2em] text-muted-taupe-on-dark shadow-apple-sm">
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
                    <span>Examine Designs & Craft Details</span>
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

              {/* Editorial Launch Headline (Reverted to Original) */}
              <h1 className="font-rayleigh text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-warm-white leading-[1.02]">
                {campaignState === 'pre-launch' && 'The first release is almost here.'}
                {campaignState === 'sold-out' && 'Ten pairs claimed.'}
                {campaignState === 'reveal' && 'A quiet debut.'}
                {campaignState === 'live' && 'Crafted to move.'}
              </h1>

              {/* Subheading (Reverted to Original) */}
              <p className="text-base sm:text-lg text-muted-taupe-on-dark max-w-xl font-normal leading-relaxed">
                {campaignState === 'pre-launch' &&
                  'Drop 001 enters final artisan finishing in Nigeria. Ten pairs of contemporary leather footwear, made for everyday movement.'}
                {campaignState === 'sold-out' &&
                  'All ten pairs of Drop 001 have been allocated. Join the private register to receive priority access to Drop 002 when leather tempering completes.'}
                {campaignState === 'reveal' &&
                  'Explore the designs, refined straps, and full-grain Nigerian hides before the purchase window opens.'}
                {campaignState === 'live' &&
                  'Contemporary leather footwear, thoughtfully made for everyday movement.'}
              </p>

              {/* Contextual Action CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                {campaignState === 'live' && (
                  <>
                    <Link
                      href="/shop"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-warm-white text-ink-black text-xs uppercase tracking-[0.2em] font-semibold hover:bg-bone transition-all duration-200 rounded-xs focus-dark min-h-[48px] shadow-apple-md hover:shadow-apple-lg active:scale-[0.99]"
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
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-warm-white text-ink-black text-xs uppercase tracking-[0.2em] font-semibold hover:bg-bone transition-colors rounded-xs focus-dark min-h-[48px] shadow-apple-md active:scale-[0.99]"
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
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-warm-white text-ink-black text-xs uppercase tracking-[0.2em] font-semibold hover:bg-bone transition-colors rounded-xs focus-dark min-h-[48px] shadow-apple-md active:scale-[0.99]"
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
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-warm-white text-ink-black text-xs uppercase tracking-[0.2em] font-semibold hover:bg-bone transition-colors rounded-xs focus-dark min-h-[48px] shadow-apple-md active:scale-[0.99]"
                    >
                      <span>Preview Designs</span>
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

              {/* Provenance Footer Badges (Reverted to Original) */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-muted-taupe-on-dark font-mono">
                <span>Handcrafted in Nigeria</span>
                <span>•</span>
                <span className="text-warm-white font-medium">Nigerian Female Leather Pams</span>
                <span>•</span>
                <span>Full-Grain Calfskin</span>
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

            {/* Right Column: Hero Visual with Watermark Layering & Apple Shadow */}
            <div className="lg:col-span-5 relative">
              {/* Subtle Atmospheric Watermark Behind Object */}
              <div
                aria-hidden="true"
                className="absolute -top-8 -left-6 sm:-left-10 z-0 select-none pointer-events-none"
              >
                <span className="font-rayleigh text-7xl sm:text-9xl font-bold tracking-widest text-warm-white/[0.06] block leading-none">
                  NOVEQ
                </span>
              </div>

              {/* Hero Image Card */}
              <div className="relative z-10 aspect-[3/4] sm:aspect-[4/3] lg:aspect-[3/4] bg-espresso/60 border border-cocoa/40 rounded-xs overflow-hidden shadow-apple-xl animate-micro-float group">
                <Image
                  src="/images/models/the-ring-hero-model.jpg"
                  alt="NOVEQ The Ring Slide Pam on model feet — Handcrafted in Nigeria"
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

      {/* ── 2. FEATURED NOVEQ COLLECTION (CLEAN, MINIMAL CATALOG) ── */}
      <section id="drop-001-grid" className="py-20 sm:py-28 bg-bone border-b border-cocoa/15 design-grid-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block mb-2">
                Launch Release
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink-black lowercase font-serif">
                noveq collection
              </h2>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-espresso hover:text-ink-black underline underline-offset-4 focus-dark min-h-[44px]"
            >
              <span>View Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. RESTRAINED EDITORIAL ACCENT PHRASE INTERLUDE ── */}
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

      {/* ── 4. EDITORIAL CAMPAIGN SPOTLIGHT (THREE DISTINCT DESIGNS ON MODEL) ── */}
      <section className="py-20 sm:py-28 bg-espresso text-warm-white border-b border-cocoa/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-taupe-on-dark font-medium block mb-2">
              Featured Designs
            </span>
            <h2 className="font-rayleigh text-3xl sm:text-5xl font-normal tracking-tight text-warm-white leading-tight">
              Three Designs. Considered Form.
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-muted-taupe-on-dark leading-relaxed">
              Handcrafted in Nigeria from full-grain calfskin. Built around everyday movement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8">
            {/* Card 1: The Ring */}
            <div className="group space-y-4">
              <Link
                href="/shop/the-ring-slide-pam"
                className="relative block aspect-[3/4] bg-ink-black border border-cocoa/30 rounded-xs overflow-hidden focus-dark shadow-apple-md group-hover:shadow-apple-xl transition-shadow duration-300"
              >
                <Image
                  src="/images/models/the-ring-hero-model.jpg"
                  alt="NOVEQ The Ring Slide Pam on model"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-ink-black/85 backdrop-blur-xs border border-cocoa/40 text-[10px] uppercase tracking-widest text-warm-white rounded-xs">
                  The Ring · Warm Cognac
                </span>
              </Link>

              <div className="space-y-2 pt-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-warm-white">
                    The Ring Slide Pam
                  </h3>
                  <span className="font-mono tabular-nums text-xs sm:text-sm text-cocoa font-medium">
                    {formattedRingPrice}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-taupe-on-dark leading-relaxed line-clamp-2">
                  A clean cut design anchored with a polished gold statement ring. Simple details, bigger impact.
                </p>
                <div className="pt-2">
                  <Link
                    href="/shop/the-ring-slide-pam"
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-warm-white hover:text-bone underline underline-offset-4 focus-dark min-h-[44px]"
                  >
                    <span>Explore The Ring</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 2: The Weave */}
            <div className="group space-y-4">
              <Link
                href="/shop/the-weave-slide-pam"
                className="relative block aspect-[3/4] bg-ink-black border border-cocoa/30 rounded-xs overflow-hidden focus-dark shadow-apple-md group-hover:shadow-apple-xl transition-shadow duration-300"
              >
                <Image
                  src="/images/models/the-weave-hero-model.jpg"
                  alt="NOVEQ The Weave Slide Pam on model"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-ink-black/85 backdrop-blur-xs border border-cocoa/40 text-[10px] uppercase tracking-widest text-warm-white rounded-xs">
                  The Weave · Deep Noir
                </span>
              </Link>

              <div className="space-y-2 pt-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-warm-white">
                    The Weave Slide Pam
                  </h3>
                  <span className="font-mono tabular-nums text-xs sm:text-sm text-cocoa font-medium">
                    {formattedWeavePrice}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-taupe-on-dark leading-relaxed line-clamp-2">
                  Braided leather straps for a textured finish. Interlocking architecture that flexes naturally across the arch.
                </p>
                <div className="pt-2">
                  <Link
                    href="/shop/the-weave-slide-pam"
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-warm-white hover:text-bone underline underline-offset-4 focus-dark min-h-[44px]"
                  >
                    <span>Explore The Weave</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 3: The Twist (Realistic On-Model Foot Photography) */}
            <div className="group space-y-4">
              <Link
                href="/shop/the-twist-slide-pam"
                className="relative block aspect-[3/4] bg-ink-black border border-cocoa/30 rounded-xs overflow-hidden focus-dark shadow-apple-md group-hover:shadow-apple-xl transition-shadow duration-300"
              >
                <Image
                  src="/images/models/the-twist-hero-model.jpg"
                  alt="NOVEQ The Twist Slide Pam on model foot stepping on warm sunlit stone"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-ink-black/85 backdrop-blur-xs border border-cocoa/40 text-[10px] uppercase tracking-widest text-warm-white rounded-xs">
                  The Twist · Burgundy
                </span>
              </Link>

              <div className="space-y-2 pt-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-warm-white">
                    The Twist Slide Pam
                  </h3>
                  <span className="font-mono tabular-nums text-xs sm:text-sm text-cocoa font-medium">
                    {formattedTwistPrice}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-taupe-on-dark leading-relaxed line-clamp-2">
                  A modern take on the classic pam with a sculptural twist strap. Minimal, refined, and made to move with you.
                </p>
                <div className="pt-2">
                  <Link
                    href="/shop/the-twist-slide-pam"
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-warm-white hover:text-bone underline underline-offset-4 focus-dark min-h-[44px]"
                  >
                    <span>Explore The Twist</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. BRAND STORY MINI-EDITORIAL BLOCK ── */}
      <section className="py-20 sm:py-28 bg-bone border-b border-cocoa/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative aspect-[4/3] bg-warm-white border border-cocoa/30 rounded-xs overflow-hidden shadow-apple-md group">
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

      {/* ── 6. SOCIAL PROOF ARCHITECTURE ── */}
      <SocialProofSection />

      {/* ── 7. ATELIER NOTES & AEO SEARCH KNOWLEDGE (DISAMBIGUATION) ── */}
      <section className="py-16 sm:py-24 bg-bone border-b border-cocoa/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-semibold block mb-2">
              Atelier Notes // NOVEQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-black font-serif">
              Nigerian Female Leather Pams & Footwear Craft
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-ink-black/80 leading-relaxed max-w-2xl">
              NOVEQ is a contemporary Nigerian footwear atelier based in Lagos, Nigeria. We re-engineer the traditional slip-on leather pam into architectural, minimalist silhouettes for modern women.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 text-xs text-ink-black/85">
            <div className="p-5 bg-warm-white border border-cocoa/25 rounded-xs space-y-2 shadow-apple-sm">
              <h3 className="font-semibold text-sm text-ink-black">What is a Nigerian female leather pam?</h3>
              <p className="text-muted-taupe leading-relaxed">
                In Nigeria, "pams" are classic slip-on leather footwear known for everyday ease and comfort. NOVEQ crafts contemporary female leather pams using thick vegetable-tanned cowhide, sculpted arch support, and hand-beveled edges for an elevated, intentional look.
              </p>
            </div>
            <div className="p-5 bg-warm-white border border-cocoa/25 rounded-xs space-y-2 shadow-apple-sm">
              <h3 className="font-semibold text-sm text-ink-black">Where are NOVEQ shoes handcrafted?</h3>
              <p className="text-muted-taupe leading-relaxed">
                Every pair of NOVEQ footwear is benchcrafted in Lagos, Nigeria in direct partnership with master leather artisans. Each pair undergoes 18 hours of hands-on cutting, strap shaping, and edge burnishing.
              </p>
            </div>
            <div className="p-5 bg-warm-white border border-cocoa/25 rounded-xs space-y-2 shadow-apple-sm">
              <h3 className="font-semibold text-sm text-ink-black">How do I order in Nigeria?</h3>
              <p className="text-muted-taupe leading-relaxed">
                Orders can be placed directly on our storefront with instant bank transfer or Paystack. We dispatch within 24–48 hours nationwide to Lagos, Abuja, Port Harcourt, and all Nigerian states via tracked courier service.
              </p>
            </div>
            <div className="p-5 bg-warm-white border border-cocoa/25 rounded-xs space-y-2 shadow-apple-sm">
              <h3 className="font-semibold text-sm text-ink-black">How do NOVEQ female pams fit?</h3>
              <p className="text-muted-taupe leading-relaxed">
                Our footwear fits true to standard European sizing (EU 37–41). Hand-selected full-grain cowhide softens naturally to foot contours over 2–3 wears with zero break-in friction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQPage Schema for Google AI Overviews and Search Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What is NOVEQ?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: "NOVEQ is a contemporary Nigerian luxury footwear atelier based in Lagos, Nigeria. The brand specializes in handcrafted female leather pams, slip-on leather slides, and vegetable-tanned artisanal footwear.",
                },
              },
              {
                '@type': 'Question',
                name: 'What is a Nigerian female leather pam?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'In Nigeria, pams are classic slip-on leather footwear known for everyday ease and comfort. NOVEQ re-engineers traditional Nigerian female leather pams with modern architectural strap geometry, full-grain vegetable-tanned cowhide, and beveled sole profiles that elevate casual and formal silhouettes alike.',
                },
              },
              {
                '@type': 'Question',
                name: 'Where are NOVEQ shoes handcrafted?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Every pair of NOVEQ footwear is benchcrafted in Lagos, Nigeria in direct partnership with master leather artisans. Each pair undergoes 18 hours of hands-on cutting, strap shaping, and edge burnishing.',
                },
              },
              {
                '@type': 'Question',
                name: 'How do I order and how fast is delivery across Nigeria?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Orders can be placed directly on our storefront with instant bank transfer or Paystack. We dispatch within 24–48 hours nationwide to Lagos, Abuja, Port Harcourt, and all Nigerian states via tracked courier service.',
                },
              },
            ],
          }),
        }}
      />

      {/* ── 7. NEWSLETTER / LAUNCH LIST / WAITLIST ── */}
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
            <div className="p-4 bg-bone border border-cocoa/30 rounded-xs inline-flex items-center gap-2 text-xs text-espresso font-medium shadow-apple-sm">
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
                className="px-6 py-3 bg-ink-black text-warm-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-espresso transition-colors rounded-xs focus-dark min-h-[44px] active:scale-[0.98] disabled:opacity-50 shadow-apple-sm"
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

export default function HomeClient({ initialProducts }: HomeClientProps = {}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink-black" />}>
      <HomeClientInner initialProducts={initialProducts} />
    </Suspense>
  );
}
