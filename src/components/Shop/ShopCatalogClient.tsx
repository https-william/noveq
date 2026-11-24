'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/Product/ProductCard';
import { MaisonCharmLoader } from '@/components/ui/MaisonCharmLoader';
import { DROP_001_PRODUCTS } from '@/data/products';
import { Product } from '@/types/commerce';
import { SlidersHorizontal, RotateCcw, X, CalendarPlus } from 'lucide-react';
import { useBlackFriday } from '@/hooks/useBlackFriday';
import { downloadBlackFridayCalendarInvite } from '@/config/blackFriday';

interface ShopCatalogClientProps {
  eyebrow?: string;
  title?: string;
  intro?: string;
  isDropCampaign?: boolean;
  initialProducts?: Product[];
}

function ShopCatalogInner({
  eyebrow,
  title,
  intro,
  isDropCampaign = false,
  initialProducts,
}: ShopCatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = (searchParams?.get('q') || '').trim();

  const [products, setProducts] = useState<Product[]>(
    initialProducts && initialProducts.length > 0 ? initialProducts : DROP_001_PRODUCTS
  );
  const { phase, isLive, isPreview } = useBlackFriday();

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

  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedColour, setSelectedColour] = useState<string>('all');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  // Extract unique filter options from catalog (ordered numerically EU 34 -> EU 44)
  const sizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s.size)));
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a.replace(/\D+/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D+/g, ''), 10) || 0;
      return numA - numB;
    });
  }, [products]);

  const colours = useMemo(() => {
    const list = products.map((p) => p.colour);
    return Array.from(new Set(list));
  }, [products]);

  // Filter products based strictly on active filters and URL search query
  const filteredProducts = useMemo(() => {
    const qLower = urlQuery.toLowerCase();
    return products.filter((product) => {
      if (qLower) {
        const haystack = [
          product.name,
          product.colour,
          product.collection,
          product.description,
          product.material,
          'leather pams',
          ...(product.colours?.map((c) => c.name) || []),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(qLower)) return false;
      }

      // Availability filter
      if (onlyAvailable && product.stock <= 0) return false;

      // Colour filter
      if (selectedColour !== 'all' && product.colour !== selectedColour) return false;

      // Size filter
      if (selectedSize !== 'all') {
        const hasSize = product.sizes.some(
          (s) => s.size === selectedSize && (!onlyAvailable || s.available)
        );
        if (!hasSize) return false;
      }

      return true;
    });
  }, [products, urlQuery, selectedSize, selectedColour, onlyAvailable]);

  const hasActiveFilters =
    Boolean(urlQuery) || selectedSize !== 'all' || selectedColour !== 'all' || onlyAvailable;

  const resetFilters = () => {
    setSelectedSize('all');
    setSelectedColour('all');
    setOnlyAvailable(false);
    if (urlQuery) {
      router.replace('/shop', { scroll: false });
    }
  };

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Dedicated Event Destination Banner for /drop-001 */}
      {isDropCampaign ? (
        <div className="pb-10 border-b border-cocoa/20 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-espresso border border-cocoa/40 rounded-full text-[11px] uppercase tracking-[0.2em] text-muted-taupe-on-dark">
            <span className="font-semibold text-warm-white">OFFICIAL LAUNCH DESTINATION</span>
            <span className="w-1 h-1 rounded-full bg-muted-taupe-on-dark" />
            <span>DROP 001</span>
          </div>

          <h1 className="font-rayleigh text-4xl sm:text-6xl font-normal tracking-tight text-ink-black leading-tight">
            The Drop 001 Collection
          </h1>

          <p className="font-serif text-2xl sm:text-3xl text-espresso italic font-normal">
            “Crafted to move.”
          </p>

          <p className="text-sm sm:text-base text-ink-black/85 max-w-2xl leading-relaxed">
            The inaugural release from NOVEQ: contemporary women’s leather pams handcrafted in Nigeria. Available for immediate allocation below.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-taupe pt-2">
            <span>Handcrafted in Nigeria</span>
            <span>•</span>
            <span>Soft Nigerian Leather</span>
            <span>•</span>
            <span>Checked by Hand</span>
            <span>•</span>
            <span className="font-semibold text-cocoa">The Weave Open Now</span>
          </div>
        </div>
      ) : (
        /* Header & Collection Intro (Strictly ONE sentence max, single H1) */
        <div className="pb-8 border-b border-cocoa/15">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium">
              {eyebrow || 'Launch Catalog · Nigerian Female Leather Pams'}
            </span>
            <span className="text-xs uppercase tracking-[0.14em] text-muted-taupe tabular-nums">
              {filteredProducts.length} of {DROP_001_PRODUCTS.length} Styles
            </span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-5xl font-normal tracking-[-0.015em] text-ink-black mt-3 leading-[1.12]">
            {title || 'The Drop 001 Collection'}
          </h1>

          {/* ONE SENTENCE MAX COLLECTION INTRO */}
          <p className="mt-3 text-[15px] sm:text-base text-ink-black/80 font-normal max-w-2xl leading-relaxed">
            {intro || 'Handcrafted in Lagos, Nigeria from soft natural leather. Everyday women’s leather pams built for easy movement, personal comfort, and tracked nationwide delivery within 7 business days.'}
          </p>
        </div>
      )}

      {/* Quiet Seasonal Edit Notice */}
      {(phase !== 'ended' || isPreview) && (
        <div className="mt-6 px-5 py-3.5 bg-warm-white border border-cocoa/12 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
            <span className="font-medium text-ink-black">
              {isLive ? 'November 27 · The 24-Hour Edit' : 'Friday, November 27 · The 24-Hour Edit'}
            </span>
            {isPreview && (
              <span className="px-2 py-0.5 rounded-full bg-bone border border-cocoa/15 text-cocoa text-[10px] font-medium">
                Preview
              </span>
            )}
            <span className="text-muted-taupe">
              {isLive
                ? '25% off all pairs applies automatically at checkout; courier delivery rates stay standard.'
                : '25% off all pairs for 24 hours on Nov 27; standard delivery rates apply.'}
            </span>
          </div>
          {!isLive && (
            <button
              type="button"
              onClick={downloadBlackFridayCalendarInvite}
              className="press-tactile inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-bone hover:bg-ink-black hover:text-warm-white border border-cocoa/15 text-[11px] font-medium text-ink-black transition-[background-color,color,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] shrink-0 cursor-pointer"
            >
              <CalendarPlus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Save Date</span>
            </button>
          )}
        </div>
      )}

      {/* Launch Filter Toolbar (Size, Colour, Availability ONLY) */}
      <div className="py-6 border-b border-cocoa/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5 uppercase tracking-[0.16em] text-muted-taupe font-semibold mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Filter</span>
          </span>

          {/* Size Filter */}
          <div className="relative">
            <label htmlFor="filter-size" className="sr-only">
              Filter by size
            </label>
            <select
              id="filter-size"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="px-3.5 py-2 bg-warm-white border border-cocoa/30 text-ink-black rounded-full text-xs focus:outline-none focus:border-ink-black shadow-xs transition-colors cursor-pointer"
            >
              <option value="all">All Sizes</option>
              {sizes.map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
          </div>

          {/* Colour Filter */}
          <div className="relative">
            <label htmlFor="filter-colour" className="sr-only">
              Filter by colour
            </label>
            <select
              id="filter-colour"
              value={selectedColour}
              onChange={(e) => setSelectedColour(e.target.value)}
              className="px-3.5 py-2 bg-warm-white border border-cocoa/30 text-ink-black rounded-full text-xs focus:outline-none focus:border-ink-black shadow-xs transition-colors cursor-pointer"
            >
              <option value="all">All Colours</option>
              {colours.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Toggle */}
          <label className="inline-flex items-center gap-2 cursor-pointer select-none py-1.5 px-3.5 bg-warm-white border border-cocoa/30 rounded-full hover:border-cocoa/60 shadow-xs transition-colors">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="w-3.5 h-3.5 accent-espresso rounded-sm"
            />
            <span className="text-xs uppercase tracking-wider text-ink-black">In Stock</span>
          </label>

          {/* Active search query chip */}
          {urlQuery && (
            <button
              type="button"
              onClick={() => router.replace('/shop', { scroll: false })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-espresso text-warm-white rounded-full text-xs focus-dark"
            >
              <span>Search: &ldquo;{urlQuery}&rdquo;</span>
              <X className="w-3 h-3" aria-hidden="true" />
            </button>
          )}

          {/* Reset Filters button when active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-cocoa hover:text-ink-black underline underline-offset-4 py-2 px-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="text-xs text-muted-taupe tracking-wider">
          Leather pams, refined for everyday wear.
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="pt-8 sm:pt-12">
        {filteredProducts.length === 0 ? (
          <div className="py-16 sm:py-24 text-center space-y-4 bg-warm-white border border-cocoa/15 rounded-xl p-8">
            <p className="text-base text-ink-black font-semibold">
              No leather pams match your selected filters.
            </p>
            <p className="text-sm text-muted-taupe">
              Try adjusting your search, size, or colour criteria. Drop 001 is a small 10-pair initial run.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-6 py-3 bg-ink-black text-warm-white text-xs uppercase tracking-[0.16em] font-medium rounded-full shadow-apple-sm active:scale-[0.97] transition-[background-color,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
            >
              View Full Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.slug}
                product={product}
                priority={idx < 2}
              />
            ))}
          </div>
        )}
      </div>

      {/* Collection Assurance Banner */}
      <div className="mt-16 sm:mt-20 p-8 sm:p-10 bg-espresso text-warm-white rounded-xl border border-cocoa/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-taupe-on-dark block mb-1.5">
            Lagos Benchcraft Assurance
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl text-warm-white font-normal leading-snug">
            Ten Pairs Initial Inventory · Handcrafted in Lagos
          </h2>
          <p className="text-sm text-muted-taupe-on-dark max-w-xl mt-2 leading-relaxed">
            Every pair of NOVEQ female leather pams is cut from soft Nigerian leather, finished gently with natural wax, and packed inside a breathable cotton dust bag with a clear care card.
          </p>
        </div>

        <div className="text-xs uppercase tracking-[0.2em] text-warm-white/90 font-medium whitespace-nowrap">
          noveq / crafted to move.
        </div>
      </div>

      {/* ── AEO / GEO High-Intent Knowledge Section (FAQ & Answers) ── */}
      <div className="mt-16 pt-12 border-t border-cocoa/15">
        <div className="max-w-3xl space-y-6">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block mb-1.5">
              Workshop Notes · Nigerian Female Leather Pams
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-normal tracking-[-0.01em] text-ink-black">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="divide-y divide-cocoa/15 text-xs text-ink-black/85 leading-relaxed">
            <div className="py-4 space-y-1">
              <h3 className="font-semibold text-sm text-ink-black">
                What are Nigerian female leather pams?
              </h3>
              <p className="text-muted-taupe">
                In Nigeria, "pams" are classic slip-on leather shoes worn for everyday ease and comfort. NOVEQ refines traditional Nigerian female leather pams with clean modern straps, soft natural leather, and cushioned soles suited to casual and dressed-up outfits alike.
              </p>
            </div>

            <div className="py-4 space-y-1">
              <h3 className="font-semibold text-sm text-ink-black">
                Where are NOVEQ female leather pams made?
              </h3>
              <p className="text-muted-taupe">
                Every pair of NOVEQ footwear is handmade by skilled shoemakers in Lagos, Nigeria. We skip factory conveyor belts so each strap and sole edge is shaped, cushioned, and checked by hand.
              </p>
            </div>

            <div className="py-4 space-y-1">
              <h3 className="font-semibold text-sm text-ink-black">
                How do I order and how fast is nationwide delivery in Nigeria?
              </h3>
              <p className="text-muted-taupe">
                You can order directly online through our secure Paystack checkout. Each pair is made to order: hand-finishing takes 5 business days, followed by 2 business days for tracked courier delivery. You will receive your order within 7 business days nationwide across Lagos, Abuja, Port Harcourt, and all Nigerian states.
              </p>
            </div>

            <div className="py-4 space-y-1">
              <h3 className="font-semibold text-sm text-ink-black">
                What sizes are available in Drop 001?
              </h3>
              <p className="text-muted-taupe">
                Drop 001 is made to order across worldwide women&apos;s sizing from EU 34 to EU 44 (UK 1.5–10 / US 4–12). Our soft natural leather gently relaxes after 2–3 wears to contour comfortably to your foot width.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQPage Structured Data for Google AI Overviews and Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What are Nigerian female leather pams?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'In Nigeria, pams are classic slip-on leather shoes known for everyday ease and comfort. NOVEQ refines traditional Nigerian female leather pams with clean modern straps, soft natural leather, and cushioned soles suited to casual and dressed-up outfits alike.',
                },
              },
              {
                '@type': 'Question',
                name: 'Where are NOVEQ female leather pams made?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Every pair of NOVEQ footwear is handmade by skilled shoemakers in Lagos, Nigeria, with hands-on leather cutting, strap shaping, and smooth edge finishing per pair.',
                },
              },
              {
                '@type': 'Question',
                name: 'How do I order and how fast is nationwide delivery in Nigeria?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'You can order directly online through our secure checkout. Hand-finishing takes 5 business days, followed by 2 business days for tracked courier delivery. You will receive your order within 7 business days nationwide.',
                },
              },
              {
                '@type': 'Question',
                name: 'What sizes are available in Drop 001?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: "Drop 001 is made to order across worldwide women's sizing from EU 34 to EU 44 (UK 1.5-10 / US 4-12). Our soft natural leather relaxes gently after 2-3 wears to contour comfortably to your foot width.",
                },
              },
            ],
          }),
        }}
      />
    </div>
  );
}

export default function ShopCatalogClient(props: ShopCatalogClientProps) {
  return (
    <Suspense
      fallback={
        <div className="py-28 flex justify-center">
          <MaisonCharmLoader size="md" tone="dark" label="Loading Collection" />
        </div>
      }
    >
      <ShopCatalogInner {...props} />
    </Suspense>
  );
}
