import { Metadata } from 'next';
import Image from 'next/image';
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
    <div className="py-10 sm:py-16 lg:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Editorial Header + Signature Typographic Plate */}
      <header className="pb-10 sm:pb-16 border-b border-cocoa/20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs uppercase tracking-[0.22em] text-cocoa block font-semibold">
            Origin &amp; Philosophy
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal tracking-[-0.02em] text-ink-black leading-[1.08]">
            Our Story
          </h1>
          <p className="font-serif text-2xl sm:text-3xl text-espresso italic font-normal leading-snug">
            “Same purpose. A new perspective.”
          </p>
          <p className="text-[15px] sm:text-base text-muted-taupe leading-[1.7] max-w-xl text-pretty">
            NOVEQ was born from a simple idea: footwear should be more than something you put on — it should fit effortlessly into how you move through life.
          </p>
        </div>

        <div className="lg:col-span-5">
          <div className="relative aspect-square w-full max-w-[300px] sm:max-w-[360px] lg:max-w-none mx-auto bg-ink-black border border-cocoa/25 rounded-2xl overflow-hidden shadow-apple-md">
            <Image
              src="/images/editorial/story-behind-noveq.png"
              alt="The Story Behind noveq editorial typographic plate"
              fill
              priority
              sizes="(max-width: 1024px) 360px, 420px"
              className="object-cover"
            />
          </div>
        </div>
      </header>

      {/* Narrative Story Flow (Alternating Editorial Blocks) */}
      <div className="py-12 sm:py-20 space-y-14 sm:space-y-24">
        {STORY_BLOCKS.map((block, index) => (
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
              aspectRatio: index === 3 ? '1/1' : '4/3',
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
        <section className="mt-4 sm:mt-8 p-6 sm:p-12 lg:p-14 bg-espresso text-warm-white border border-cocoa/30 rounded-2xl shadow-apple-md space-y-6">
          <div className="max-w-2xl space-y-3.5">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-taupe-on-dark font-medium block">
              Begin With Drop 001
            </span>
            <h2 className="font-editorial text-2xl sm:text-4xl font-normal tracking-[-0.015em] text-warm-white leading-tight text-balance">
              Made to order. Considered from sole to strap.
            </h2>
            <p className="text-sm text-muted-taupe-on-dark leading-relaxed text-pretty">
              Explore The Weave across EU 34–44, handcrafted to order in Lagos from soft natural leather and delivered nationwide within 7 business days.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-warm-white text-ink-black text-xs uppercase tracking-[0.18em] font-semibold hover:bg-bone transition-[background-color,transform] duration-[180ms] rounded-full focus-dark min-h-[48px] shadow-apple-sm active:scale-[0.98]"
            >
              <span>Explore Drop 001</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/journal"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-warm-white/30 text-warm-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-warm-white/10 transition-[background-color,transform] duration-[180ms] rounded-full focus-dark min-h-[48px] active:scale-[0.98]"
            >
              <span>Read Journal</span>
            </Link>
          </div>

          <div className="pt-6 border-t border-cocoa/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-taupe-on-dark">
            <span className="font-serif italic text-warm-white text-sm">noveq / crafted to move.</span>
            <span>Handcrafted contemporary leather footwear · Lagos, Nigeria</span>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
