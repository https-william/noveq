'use client';

import { useState, useMemo } from 'react';
import ProductCard from '@/components/Product/ProductCard';
import { DROP_001_PRODUCTS } from '@/data/products';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

interface ShopCatalogClientProps {
  eyebrow?: string;
  title?: string;
  intro?: string;
  isDropCampaign?: boolean;
}

export default function ShopCatalogClient({
  eyebrow,
  title,
  intro,
  isDropCampaign = false,
}: ShopCatalogClientProps) {
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedColour, setSelectedColour] = useState<string>('all');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  // Extract unique filter options from 10-pair catalog
  const sizes = useMemo(() => {
    const set = new Set<string>();
    DROP_001_PRODUCTS.forEach((p) => p.sizes.forEach((s) => set.add(s.size)));
    return Array.from(set).sort();
  }, []);

  const colours = useMemo(() => {
    const list = DROP_001_PRODUCTS.map((p) => p.colour);
    return Array.from(new Set(list));
  }, []);

  // Filter products based strictly on active filters
  const filteredProducts = useMemo(() => {
    return DROP_001_PRODUCTS.filter((product) => {
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
  }, [selectedSize, selectedColour, onlyAvailable]);

  const hasActiveFilters =
    selectedSize !== 'all' || selectedColour !== 'all' || onlyAvailable;

  const resetFilters = () => {
    setSelectedSize('all');
    setSelectedColour('all');
    setOnlyAvailable(false);
  };

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Dedicated Event Destination Banner for /drop-001 */}
      {isDropCampaign ? (
        <div className="pb-10 border-b border-cocoa/20 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-espresso border border-cocoa/40 rounded-xs text-[11px] uppercase tracking-[0.2em] text-muted-taupe-on-dark">
            <span className="font-semibold text-warm-white">OFFICIAL LAUNCH DESTINATION</span>
            <span className="w-1 h-1 rounded-full bg-muted-taupe-on-dark" />
            <span>DROP 001</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-ink-black leading-tight lowercase font-serif">
            noveq collection
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
            <span>Vegetable-Tanned Nigerian Hide</span>
            <span>•</span>
            <span>Pair-by-Pair Inspected</span>
            <span>•</span>
            <span className="font-semibold text-cocoa">Direct Buy Active</span>
          </div>
        </div>
      ) : (
        /* Header & Collection Intro (Strictly ONE sentence max, single H1) */
        <div className="pb-8 border-b border-cocoa/20">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium">
              {eyebrow || 'Launch Catalog // Drop 001'}
            </span>
            <span className="text-xs text-muted-taupe tracking-wider font-mono">
              {filteredProducts.length} of {DROP_001_PRODUCTS.length} Styles Available
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink-black mt-2">
            {title || "NOVEQ Drop 001 — Women's Leather Pams"}
          </h1>

          {/* ONE SENTENCE MAX COLLECTION INTRO */}
          <p className="mt-3 text-sm sm:text-base text-ink-black/80 font-normal max-w-2xl leading-relaxed">
            {intro || 'Drop 001 introduces NOVEQ through a small release of women’s leather pams.'}
          </p>
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
              className="px-3 py-2 bg-warm-white border border-cocoa/30 text-ink-black rounded-xs text-xs focus:outline-none focus:border-ink-black transition-colors"
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
              className="px-3 py-2 bg-warm-white border border-cocoa/30 text-ink-black rounded-xs text-xs focus:outline-none focus:border-ink-black transition-colors"
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
          <label className="inline-flex items-center gap-2 cursor-pointer select-none py-1.5 px-3 bg-warm-white border border-cocoa/30 rounded-xs hover:border-cocoa/60 transition-colors">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="w-3.5 h-3.5 accent-espresso rounded-xs"
            />
            <span className="text-xs uppercase tracking-wider text-ink-black">In Stock</span>
          </label>

          {/* Reset Filters button when active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-cocoa hover:text-ink-black underline underline-offset-4 py-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="text-xs text-muted-taupe tracking-wider font-light">
          Leather pams, refined for everyday wear.
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="pt-10">
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center space-y-4 bg-warm-white border border-cocoa/20 rounded-sm p-8">
            <p className="text-base text-ink-black font-semibold">
              No leather pams match your selected filters.
            </p>
            <p className="text-xs text-muted-taupe">
              Try adjusting your size or colour criteria. Drop 001 is a small 10-pair initial run.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-black text-warm-white text-xs uppercase tracking-[0.16em] font-medium rounded-xs"
            >
              View Full Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
      <div className="mt-20 p-8 bg-espresso text-warm-white rounded-sm border border-cocoa/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-taupe-on-dark block mb-1">
            Artisan Production Assurance
          </span>
          <h2 className="text-lg font-bold text-warm-white">
            Ten Pairs Initial Inventory
          </h2>
          <p className="text-xs text-muted-taupe-on-dark max-w-xl mt-1 leading-relaxed">
            Every pam is built from full-grain leather, conditioned with natural wax, and individually boxed in our slim brown kraft suite with handwritten care instructions.
          </p>
        </div>

        <div className="text-xs uppercase tracking-widest text-warm-white/90 font-medium whitespace-nowrap">
          noveq / crafted to move.
        </div>
      </div>
    </div>
  );
}
