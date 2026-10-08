import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { STORY_BLOCKS } from '@/data/story';
import { EditorialBlock } from '@/components/Editorial/EditorialBlock';
import { ScrollReveal } from '@/components/Editorial/ScrollReveal';

export const metadata: Metadata = {
  title: 'Our Story - Design Philosophy & Craft Context',
  description:
    'Why NOVEQ exists: modern design philosophy, Nigerian artisan shoemaking context, and the foundation behind Drop 001.',
  alternates: {
    canonical: '/story',
  },
  openGraph: {
    title: 'Our Story | NOVEQ Contemporary Leather Footwear',
    description:
      'Why NOVEQ exists: modern design philosophy, Nigerian artisan shoemaking context, and the foundation behind Drop 001.',
    url: '/story',
    siteName: 'NOVEQ',
    type: 'website',
    images: [
      {
        url: '/images/editorial/artisan-workshop.jpg',
        width: 1200,
        height: 900,
        alt: 'NOVEQ artisan shoemaking craft and leather detail',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Story | NOVEQ Contemporary Leather Footwear',
    description:
      'Why NOVEQ exists: modern design philosophy, Nigerian artisan shoemaking context, and the foundation behind Drop 001.',
    images: ['/images/editorial/artisan-workshop.jpg'],
  },
};

export default function StoryPage() {
  return (
    <div className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <header className="max-w-3xl pb-12 sm:pb-16 border-b border-cocoa/20">
        <span className="text-xs uppercase tracking-[0.2em] text-cocoa block mb-3 font-semibold">
          Origin & Philosophy
        </span>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink-black leading-tight">
          Our Story
        </h1>
        <p className="mt-4 font-serif text-2xl sm:text-3xl text-espresso italic font-normal">
          “Same purpose. A new perspective.”
        </p>
        <p className="mt-4 text-sm sm:text-base text-muted-taupe leading-relaxed">
          NOVEQ exists to bring modern restraint and material integrity to everyday leather footwear. A concise narrative of why we design, who crafts our footwear, and how we build.
        </p>
      </header>

      {/* Narrative Story Flow (Alternating Editorial Blocks) */}
      <div className="py-16 sm:py-24 space-y-20 sm:space-y-28">
        {STORY_BLOCKS.map((block) => (
          <EditorialBlock
            key={block.id}
            id={block.id}
            eyebrow={block.eyebrow}
            heading={block.heading}
            body={block.body}
            accentQuote={block.accentQuote}
            image={{
              src: block.image,
              alt: block.altText,
              caption: block.caption,
              aspectRatio: '4/3',
            }}
            imagePosition={block.imagePosition || 'right'}
            cta={
              block.ctaText && block.ctaHref
                ? {
                    text: block.ctaText,
                    href: block.ctaHref,
                    variant: block.ctaVariant || 'underline',
                  }
                : undefined
            }
          />
        ))}
      </div>

      {/* Closing Call to Action & Brand Sign-off */}
      <ScrollReveal>
        <section className="mt-12 sm:mt-16 p-8 sm:p-14 bg-espresso text-warm-white border border-cocoa/30 rounded-xs space-y-6">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-taupe-on-dark font-medium block">
              Begin With Drop 001
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-warm-white">
              Ten pairs. Considered from sole to strap.
            </h2>
            <p className="text-xs sm:text-sm text-muted-taupe-on-dark leading-relaxed">
              Discover Drop 001 in small-batch runs. Handmade in Lagos with full-grain leather, delivered nationwide with tracked dispatch.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-warm-white text-ink-black text-xs uppercase tracking-[0.18em] font-semibold hover:bg-bone transition-colors rounded-xs focus-dark min-h-[44px]"
            >
              <span>Explore The Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/journal"
              className="inline-flex items-center gap-2 px-6 py-3.5 border border-warm-white/30 text-warm-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-warm-white/10 transition-colors rounded-xs focus-dark min-h-[44px]"
            >
              <span>Read Journal</span>
            </Link>
          </div>

          <div className="pt-6 border-t border-cocoa/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-taupe-on-dark">
            <span className="font-serif italic text-warm-white text-sm">noveq / crafted to move.</span>
            <span>Independent contemporary leather footwear - Lagos, Nigeria</span>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
