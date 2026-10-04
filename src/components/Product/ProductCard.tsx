'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { Product } from '@/types/commerce';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const [quickAddLoading, setQuickAddLoading] = useState(false);

  const primaryImage = product.images[0] || {
    src: '/images/products/the-twist.jpg',
    alt: product.name,
  };

  // Determine low stock label
  const isLowStock = product.stock > 0 && product.stock <= 3;

  // First available size for quick add
  const defaultSize = product.sizes.find((s) => s.available)?.size;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultSize) return;

    setQuickAddLoading(true);
    setTimeout(() => {
      addToCart(product, defaultSize, 1);
      setQuickAddLoading(false);
    }, 200);
  };

  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: product.currency,
    maximumFractionDigits: 0,
  }).format(product.price);

  const formattedComparePrice = product.compare_at_price
    ? new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: product.currency,
        maximumFractionDigits: 0,
      }).format(product.compare_at_price)
    : null;

  return (
    <article
      className="group relative bg-warm-white border border-cocoa/20 rounded-sm flex flex-col justify-between overflow-hidden transition-all duration-200 hover:border-cocoa/50"
    >
      <Link
        href={`/shop/${product.slug}`}
        className="block focus-dark"
        aria-label={`View ${product.name} — ${formattedPrice}`}
      >
        {/* Product Image Frame (Consistent crop) */}
        <div className="relative aspect-[4/3] sm:aspect-square bg-espresso/30 border-b border-cocoa/15 overflow-hidden">
          <Image
            src={primaryImage.src}
            alt={primaryImage.alt}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
            {/* Real Stock Signal */}
            {isLowStock ? (
              <span className="px-2 py-0.5 bg-espresso text-warm-white text-[10px] uppercase tracking-widest font-medium rounded-xs">
                {product.stock} left
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-bone/90 border border-cocoa/20 text-cocoa text-[10px] uppercase tracking-widest font-medium rounded-xs">
                {product.collection}
              </span>
            )}

            {/* Optional Charm Indicator (Only for products that support it) */}
            {product.charm_option.supported && (
              <span
                title="Heart charm attachment point"
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-warm-white/90 border border-cocoa/30 text-oxblood text-[10px] uppercase tracking-widest font-semibold rounded-xs shadow-xs"
              >
                <Heart className="w-2.5 h-2.5 fill-oxblood" aria-hidden="true" />
                <span>Charm</span>
              </span>
            )}
          </div>
        </div>

        {/* Product Details Content */}
        <div className="p-5 sm:p-6 space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-ink-black text-base group-hover:text-espresso transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-muted-taupe line-clamp-1 font-normal">
              {product.colour}
            </p>
          </div>

          <p className="text-xs text-muted-taupe line-clamp-2 leading-relaxed font-normal">
            {product.description}
          </p>
        </div>
      </Link>

      {/* Card Footer: Always-visible price and action */}
      <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-3 border-t border-cocoa/15 flex items-center justify-between">
        {/* Price (Never hidden or hover-gated) */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-ink-black">
              {formattedPrice}
            </span>
            {formattedComparePrice && (
              <span className="text-xs text-muted-taupe line-through">
                {formattedComparePrice}
              </span>
            )}
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-taupe block mt-0.5">
            Launch pricing
          </span>
        </div>

        {/* Quick Add (Desktop only, minimal) / Direct Link */}
        <div className="flex items-center gap-2">
          {defaultSize && (
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={quickAddLoading}
              aria-label={`Quick add ${product.name} in ${defaultSize} to bag`}
              className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 border border-cocoa/40 text-[11px] uppercase tracking-wider font-medium text-ink-black hover:bg-espresso hover:text-warm-white transition-colors rounded-xs focus-dark"
            >
              <span>{quickAddLoading ? 'Adding...' : `+ ${defaultSize}`}</span>
            </button>
          )}

          <Link
            href={`/shop/${product.slug}`}
            className="p-1.5 text-espresso hover:text-ink-black transition-colors focus-dark rounded-xs"
            aria-label={`View details for ${product.name}`}
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
