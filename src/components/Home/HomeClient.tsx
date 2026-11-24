'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/Product/ProductCard';
import { AtelierSpecimenInspector } from '@/components/Atelier/AtelierSpecimenInspector';
import { SocialProofSection } from '@/components/SocialProof/SocialProofSection';
import { ScrollReveal } from '@/components/Editorial/ScrollReveal';
import { BlackFridayEditorialSection } from '@/components/BlackFriday/BlackFridayEditorialSection';
import { DROP_001_PRODUCTS } from '@/data/products';
import { Product } from '@/types/commerce';
import { SITE_SETTINGS } from '@/config/siteSettings';
import { CampaignState } from '@/types/content';

interface HomeClientProps {
  initialProducts?: Product[];
}

function HomeClientInner({ initialProducts }: HomeClientProps) {
  const [products, setProducts] = useState<Product[]>(
    initialProducts && initialProducts.length > 0 ? initialProducts : DROP_001_PRODUCTS
  );
  const [isConstrainedNetwork, setIsConstrainedNetwork] = useState(false);

  useEffect(() => {
    setIsConstrainedNetwork(document.documentElement.dataset.nvqSlowNet === '1');
  }, []);

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

  const searchParams = useSearchParams();

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

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* ── 1. HERO SECTION (FULL-BLEED MAISON CAMPAIGN CANVAS) ── */}
      <section className="relative bg-ink-black text-warm-white border-b border-warm-white/10 overflow-hidden min-h-[82svh] sm:min-h-[80svh] lg:min-h-[86svh] flex items-end">
        {/* Full-Bleed Campaign Film / Photoshoot Backdrop */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          {isConstrainedNetwork ? (
            <Image
              src="/images/hero/landing-hero-photoshoot.jpg"
              alt="NOVEQ contemporary handcrafted leather footwear in movement"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          ) : (
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster="/images/hero/landing-hero-photoshoot.jpg"
              aria-label="NOVEQ contemporary handcrafted leather footwear in movement"
              className="w-full h-full object-cover object-center block [transform:translateZ(0)]"
            >
              <source src="/videos/landing-hero-video.mp4" type="video/mp4" />
            </video>
          )}

          {/* Warm Espresso Atmospheric Scrims for Serene Contrast */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink-black via-ink-black/50 to-ink-black/25"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-radial from-transparent via-transparent to-ink-black/55"
          />
        </div>

        {/* Poised Centered Maison Lockup */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-8 pb-12 sm:pb-16 lg:pb-20 pt-28 text-center">
          <div className="space-y-4 sm:space-y-5">
            {/* Subtle Architectural Eyebrow */}
            <p className="text-xs uppercase tracking-[0.22em] text-warm-white/85 font-medium">
              {campaignState === 'pre-launch' && 'Pre-Launch Preview · Drop 001'}
              {campaignState === 'sold-out' && 'Drop 001 · Allocation Complete'}
              {campaignState === 'reveal' && 'Drop 001 · Private Preview'}
              {campaignState === 'live' && 'Drop 001 · Handcrafted in Lagos'}
            </p>

            {/* Editorial Display Headline */}
            <h1 className="font-rayleigh text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-warm-white leading-[1.06] text-balance">
              {campaignState === 'pre-launch' && 'The first release is almost here.'}
              {campaignState === 'sold-out' && 'Ten pairs claimed.'}
              {campaignState === 'reveal' && 'A quiet debut.'}
              {campaignState === 'live' && 'Crafted to move.'}
            </h1>

            {/* Restrained Poetic Subheading */}
            <p className="text-[15px] sm:text-base text-warm-white/90 max-w-lg mx-auto font-normal leading-relaxed">
              {campaignState === 'pre-launch' &&
                'Drop 001 enters final artisan finishing in Lagos. Ten pairs of contemporary leather footwear, made for everyday movement.'}
              {campaignState === 'sold-out' &&
                'All ten pairs of Drop 001 have been allocated. Join the private register for early access to Drop 002.'}
              {campaignState === 'reveal' &&
                'Explore the silhouettes, hand-shaped straps, and soft Nigerian leather ahead of opening day.'}
              {campaignState === 'live' &&
                'Contemporary leather footwear, thoughtfully made for everyday movement.'}
            </p>

            {/* Primary CTA + Quiet Secondary Link */}
            <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-7">
              {campaignState === 'live' && (
                <>
                  <Link
                    href="/shop"
                    className="group press-tactile inline-flex items-center gap-3.5 pl-6 pr-2 py-2 bg-warm-white text-ink-black text-xs font-medium hover:bg-bone transition-[background-color,transform,box-shadow] duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] rounded-full focus-dark min-h-[46px] shadow-apple-md hover:shadow-apple-lg"
                  >
                    <span>Discover Drop 001</span>
                    <span className="w-8 h-8 rounded-full bg-ink-black text-warm-white flex items-center justify-center transition-transform duration-[220ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                  <Link
                    href="/story"
                    className="inline-flex items-center justify-center py-2 text-[11px] uppercase tracking-[0.22em] font-medium text-warm-white/85 hover:text-warm-white underline underline-offset-8 decoration-warm-white/40 hover:decoration-warm-white transition-[color,text-decoration-color,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-dark"
                  >
                    <span>Read Our Story</span>
                  </Link>
                </>
              )}

              {campaignState === 'pre-launch' && (
                <>
                  <a
                    href="#launch-access"
                    className="group inline-flex items-center gap-3 px-8 py-3.5 bg-warm-white text-ink-black text-[11px] uppercase tracking-[0.22em] font-semibold hover:bg-bone transition-[background-color,transform,box-shadow] duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] rounded-full focus-dark min-h-[46px] shadow-apple-md active:scale-[0.97]"
                  >
                    <span>Join Launch List</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5" />
                  </a>
                  <Link
                    href="/story"
                    className="inline-flex items-center justify-center py-2 text-[11px] uppercase tracking-[0.22em] font-medium text-warm-white/85 hover:text-warm-white underline underline-offset-8 decoration-warm-white/40 hover:decoration-warm-white transition-[color,text-decoration-color] duration-[180ms] focus-dark"
                  >
                    <span>Read Our Story</span>
                  </Link>
                </>
              )}

              {campaignState === 'sold-out' && (
                <>
                  <a
                    href="#launch-access"
                    className="group inline-flex items-center gap-3 px-8 py-3.5 bg-warm-white text-ink-black text-[11px] uppercase tracking-[0.22em] font-semibold hover:bg-bone transition-[background-color,transform,box-shadow] duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] rounded-full focus-dark min-h-[46px] shadow-apple-md active:scale-[0.97]"
                  >
                    <span>Join Drop 002 Waitlist</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5" />
                  </a>
                  <Link
                    href="/drop-001"
                    className="inline-flex items-center justify-center py-2 text-[11px] uppercase tracking-[0.22em] font-medium text-warm-white/85 hover:text-warm-white underline underline-offset-8 decoration-warm-white/40 hover:decoration-warm-white transition-[color,text-decoration-color] duration-[180ms] focus-dark"
                  >
                    <span>View Drop 001 Archive</span>
                  </Link>
                </>
              )}

              {campaignState === 'reveal' && (
                <>
                  <a
                    href="#drop-001-grid"
                    className="group inline-flex items-center gap-3 px-8 py-3.5 bg-warm-white text-ink-black text-[11px] uppercase tracking-[0.22em] font-semibold hover:bg-bone transition-[background-color,transform,box-shadow] duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] rounded-full focus-dark min-h-[46px] shadow-apple-md active:scale-[0.97]"
                  >
                    <span>Preview Designs</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5" />
                  </a>
                  <a
                    href="#launch-access"
                    className="inline-flex items-center justify-center py-2 text-[11px] uppercase tracking-[0.22em] font-medium text-warm-white/85 hover:text-warm-white underline underline-offset-8 decoration-warm-white/40 hover:decoration-warm-white transition-[color,text-decoration-color] duration-[180ms] focus-dark"
                  >
                    <span>Get Private Access</span>
                  </a>
                </>
              )}
            </div>

            {campaignState === 'pre-launch' && (
              <p className="pt-2 text-[11px] uppercase tracking-[0.22em] text-warm-white/65">
                Release: {SITE_SETTINGS.campaign?.preLaunchDateText || 'October 2026'}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── 2. FEATURED NOVEQ COLLECTION (SERENE MAISON GALLERY) ── */}
      <section id="drop-001-grid" className="py-16 sm:py-24 bg-bone border-b border-cocoa/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-4">
            <span className="text-xs uppercase tracking-[0.22em] text-cocoa font-medium block">
              Drop 001 · Lagos Atelier
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-[2.75rem] font-normal tracking-[-0.015em] leading-[1.15] text-ink-black text-balance">
              The Foundational Silhouettes
            </h2>
            <p className="text-[15px] sm:text-base text-muted-taupe max-w-xl mx-auto leading-relaxed text-pretty">
              Ten pairs per silhouette cut from soft natural leather, shaped with cushioned arch support and smooth, rounded edges.
            </p>
            <div className="pt-1">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-espresso hover:text-ink-black underline underline-offset-8 decoration-cocoa/40 hover:decoration-ink-black transition-[color,text-decoration-color] duration-[180ms] focus-dark py-2"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {products.map((product, idx) => (
              <ProductCard key={product.slug} product={product} priority={idx === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. RESTRAINED EDITORIAL ACCENT PHRASE INTERLUDE ── */}
      <ScrollReveal className="py-20 sm:py-28 bg-warm-white border-b border-cocoa/15 text-center">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 space-y-5">
          <blockquote className="font-serif text-3xl sm:text-5xl lg:text-6xl text-espresso font-normal italic tracking-tight leading-tight text-balance">
            “Same purpose. A new perspective.”
          </blockquote>
          <p className="text-[15px] sm:text-base text-muted-taupe max-w-lg mx-auto leading-relaxed text-pretty">
            We began with a staple familiar to every Nigerian wardrobe: the everyday leather slip-on. We asked what happens when you craft that familiar shape with quiet restraint and soft, lasting leather.
          </p>
        </div>
      </ScrollReveal>

      {/* ── 4. SAVOIR-FAIRE MATERIAL INDEX ── */}
      <AtelierSpecimenInspector />

      {/* ── 5. BRAND STORY MINI-EDITORIAL BLOCK ── */}
      <section className="py-16 sm:py-24 bg-bone border-b border-cocoa/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="md:col-span-5 order-2 md:order-1">
              <div className="relative aspect-[4/3] md:aspect-[4/5] bg-warm-white border border-cocoa/20 rounded-xl overflow-hidden shadow-apple-md group">
                <Image
                  src="/images/editorial/artisan-workshop.jpg"
                  alt="NOVEQ artisan partner in Lagos hand-cutting and shaping soft leather pams at his workbench"
                  fill
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="object-cover hover-image-zoom"
                />
              </div>
            </div>

            <div className="md:col-span-7 order-1 md:order-2 space-y-5 sm:space-y-6">
              <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block">
                Lagos Workshop
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-[2.75rem] font-normal tracking-[-0.015em] text-ink-black leading-[1.15] text-balance">
                Made by hand in Nigeria. Built for everyday movement.
              </h2>
              <div className="space-y-4 text-[15px] sm:text-base text-ink-black/85 leading-[1.65] max-w-xl text-pretty">
                <p>
                  Every pair of NOVEQ footwear is shaped side-by-side with experienced shoemakers in Lagos. We skip factory conveyor lines so every cut and stitch gets real attention.
                </p>
                <p>
                  We choose thick, supple Nigerian leather, shape each strap by hand, and cushion every footbed for easy walking from sunny streets to smooth marble floors.
                </p>
              </div>
              <div className="pt-1">
                <Link
                  href="/story"
                  className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-cocoa hover:text-ink-black underline underline-offset-8 decoration-cocoa/40 hover:decoration-ink-black transition-[color,text-decoration-color] duration-[180ms] focus-dark py-2"
                >
                  <span>Read our origin story</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. SOCIAL PROOF ARCHITECTURE ── */}
      <SocialProofSection />

      {/* ── 7. NOTES ON CRAFT (HAIRLINE EDITORIAL INDEX) ── */}
      <section className="py-20 sm:py-28 bg-bone border-b border-cocoa/15">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block">
              Maison Guide
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-normal tracking-[-0.015em] text-ink-black leading-[1.18]">
              Nigerian Female Leather Pams &amp; Craft
            </h2>
            <p className="text-[15px] sm:text-base text-muted-taupe leading-relaxed">
              NOVEQ is a contemporary Nigerian footwear maison based in Lagos, refining the slip-on leather pam into serene, architectural silhouettes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 border-t border-b border-cocoa/15 py-10 text-ink-black/85">
            <div className="space-y-2">
              <h3 className="font-editorial text-lg sm:text-xl text-ink-black font-normal leading-snug">
                What is a Nigerian female leather pam?
              </h3>
              <p className="text-sm text-muted-taupe leading-relaxed">
                In Nigeria, &ldquo;pams&rdquo; are classic slip-on leather shoes worn for effortless everyday comfort. NOVEQ refines the shape with soft natural leather, cushioned arch support, and smooth, rounded strap edges.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-editorial text-lg sm:text-xl text-ink-black font-normal leading-snug">
                Where are NOVEQ shoes made?
              </h3>
              <p className="text-sm text-muted-taupe leading-relaxed">
                Every pair is shaped by hand in Lagos, Nigeria by skilled local shoemakers, cut, cushioned, and smoothly sealed pair by pair.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-editorial text-lg sm:text-xl text-ink-black font-normal leading-snug">
                How do I order and when will my pair arrive?
              </h3>
              <p className="text-sm text-muted-taupe leading-relaxed">
                Orders are placed directly online via secure Paystack checkout or bank transfer. Each pair is made in 5 business days plus 2 business days tracked courier delivery nationwide (7 business days total).
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-editorial text-lg sm:text-xl text-ink-black font-normal leading-snug">
                How do NOVEQ female pams fit?
              </h3>
              <p className="text-sm text-muted-taupe leading-relaxed">
                Our pairs are made to order across worldwide women&apos;s sizing from EU 34 to EU 44 (UK 1.5–10 / US 4–12). The natural leather softens gently after 2–3 wears to contour comfortably to your foot width.
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
                  text: "NOVEQ is a contemporary Nigerian footwear brand based in Lagos, Nigeria, specializing in handcrafted women's leather pams and everyday slip-on leather slides.",
                },
              },
              {
                '@type': 'Question',
                name: 'What is a Nigerian female leather pam?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'In Nigeria, pams are classic slip-on leather shoes known for everyday ease and comfort. NOVEQ refines traditional Nigerian female leather pams with clean modern straps, soft natural leather, and cushioned soles.',
                },
              },
              {
                '@type': 'Question',
                name: 'Where are NOVEQ shoes handcrafted?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Every pair of NOVEQ footwear is made by hand in Lagos, Nigeria with skilled local shoemakers, undergoing individual leather cutting, strap shaping, and smooth edge finishing.',
                },
              },
              {
                '@type': 'Question',
                name: 'How do I order and how fast is delivery across Nigeria?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Orders are placed directly online with secure Paystack checkout. Hand-finishing takes 5 business days, followed by 2 business days for tracked courier delivery across Nigeria (7 business days total).',
                },
              },
            ],
          }),
        }}
      />

      {/* ── SEASONAL NOTE · NOVEMBER 27 ── */}
      <BlackFridayEditorialSection />

      {/* ── 8. CLOSING EDITORIAL INVITATION ── */}
      <section className="py-20 sm:py-28 bg-warm-white text-ink-black border-b border-cocoa/15 text-center">
        <div className="max-w-xl mx-auto px-5 sm:px-6 space-y-5">
          <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block">
            Lagos Studio
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-[2.75rem] font-normal tracking-[-0.015em] text-ink-black leading-[1.14] text-balance">
            Ten Pairs. Handcrafted for Everyday Movement.
          </h2>
          <p className="text-[15px] sm:text-base text-muted-taupe max-w-md mx-auto leading-relaxed text-pretty">
            Drop 001 is made in small batches of ten pairs per design so every strap is shaped, softened, and checked by hand. Delivered nationwide within 7 business days.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/shop"
              className="group press-tactile inline-flex items-center gap-3.5 pl-6 pr-2 py-2 bg-ink-black text-warm-white text-xs font-medium hover:bg-espresso transition-[background-color,transform,box-shadow] duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] rounded-full focus-dark min-h-[46px] shadow-apple-md hover:shadow-apple-lg"
            >
              <span>Explore Drop 001</span>
              <span className="w-8 h-8 rounded-full bg-warm-white text-ink-black flex items-center justify-center transition-transform duration-[220ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
            <Link
              href="/story"
              className="inline-flex items-center justify-center py-2 text-xs uppercase tracking-[0.18em] font-medium text-espresso hover:text-ink-black underline underline-offset-8 decoration-cocoa/40 hover:decoration-ink-black transition-[color,text-decoration-color] duration-[180ms] focus-dark"
            >
              <span>Read Our Story</span>
            </Link>
          </div>
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
