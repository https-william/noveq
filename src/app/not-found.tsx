import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Compass, ArrowLeft } from 'lucide-react';
import { DROP_001_PRODUCTS } from '@/data/products';

export default function NotFound() {
  const featuredProduct = DROP_001_PRODUCTS[0];

  return (
    <div className="py-16 sm:py-28 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
      {/* 404 Header */}
      <div className="space-y-4 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-espresso/10 text-espresso text-[11px] uppercase tracking-widest font-semibold rounded-xs">
          <Compass className="w-3.5 h-3.5 text-cocoa" />
          <span>404 · Path Not Found</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink-black">
          Out of Step.
        </h1>

        <p className="font-serif text-2xl sm:text-3xl text-espresso italic font-normal">
          “Same purpose. A new perspective.”
        </p>

        <p className="text-xs sm:text-sm text-muted-taupe leading-relaxed">
          The link you followed may have moved or expired, but Drop 001 is waiting. Don&apos;t let a dead-end interrupt your stride.
        </p>
      </div>

      {/* Direct Route Back to Commerce */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/shop"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-ink-black text-warm-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-espresso transition-colors rounded-xs focus-dark min-h-[44px]"
        >
          <span>Explore Drop 001</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/story"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-cocoa/30 text-ink-black text-xs uppercase tracking-[0.18em] font-semibold hover:bg-bone transition-colors rounded-xs focus-dark min-h-[44px]"
        >
          <span>Read Our Story</span>
        </Link>
      </div>

      {/* Featured Drop 001 Pair Snapshot */}
      {featuredProduct && (
        <div className="pt-8 border-t border-cocoa/20 max-w-lg mx-auto">
          <span className="text-[11px] uppercase tracking-widest text-cocoa font-medium block mb-3">
            Available in Limited Release
          </span>
          <div className="p-4 bg-warm-white border border-cocoa/25 rounded-xs flex items-center gap-4 text-left">
            <div className="relative w-20 h-20 bg-bone border border-cocoa/20 rounded-xs shrink-0 overflow-hidden">
              <Image
                src={featuredProduct.images[0]?.src || '/images/brand/packaging.jpg'}
                alt={featuredProduct.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-ink-black truncate">
                {featuredProduct.name}
              </h2>
              <p className="text-xs text-muted-taupe">
                {featuredProduct.colour} · ₦{featuredProduct.price.toLocaleString()}
              </p>
              <Link
                href={`/shop/${featuredProduct.slug}`}
                className="inline-flex items-center gap-1 text-xs text-espresso font-semibold underline underline-offset-4 mt-1 focus-dark"
              >
                <span>View Pair</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-taupe">
        <Link href="/" className="hover:text-ink-black underline focus-dark">
          Homepage
        </Link>
        <span>·</span>
        <Link href="/journal" className="hover:text-ink-black underline focus-dark">
          Atelier Journal
        </Link>
        <span>·</span>
        <Link href="/contact" className="hover:text-ink-black underline focus-dark">
          Contact Concierge
        </Link>
      </div>
    </div>
  );
}
