'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ArrowRight, Check } from 'lucide-react';
import { Product } from '@/types/commerce';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart, openDrawer } = useCart();
  const [addingSize, setAddingSize] = useState<string | null>(null);
  const [addedSize, setAddedSize] = useState<string | null>(null);

  const primaryImage = product.images[0] || {
    src: '/images/products/the-twist.jpg',
    alt: product.name,
  };

  // Determine low stock label
  const isLowStock = product.stock > 0 && product.stock <= 3;

  const handleSizeQuickAdd = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (addingSize) return;

    setAddingSize(size);
    setTimeout(() => {
      addToCart(product, size, 1);
      setAddingSize(null);
      setAddedSize(size);
      openDrawer();
      setTimeout(() => {
        setAddedSize(null);
      }, 1600);
    }, 220);
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
      className="group relative bg-warm-white border border-cocoa/20 rounded-sm flex flex-col justify-between overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-apple-md hover:border-cocoa/40"
    >
      <Link
        href={`/shop/${product.slug}`}
        className="block focus-dark"
        aria-label={`View ${product.name} - ${formattedPrice}`}
      >
        {/* Product Image Frame (Consistent crop) */}
        <div className="relative aspect-[4/3] sm:aspect-square bg-espresso/30 border-b border-cocoa/15 overflow-hidden">
          <Image
            src={primaryImage.src}
            alt={primaryImage.alt}
            fill
            priority={priority}
            unoptimized={primaryImage.src.startsWith('data:')}
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

      {/* Direct Size Availability Chips (Strategy C) */}
      <div className="px-5 sm:px-6 py-3 border-t border-cocoa/15 bg-bone/35 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-taupe font-medium">
          Quick Size
        </span>

        <div className="flex items-center gap-1.5" role="group" aria-label="Available shoe sizes">
          {product.sizes.map((sz) => {
            const isAdding = addingSize === sz.size;
            const isJustAdded = addedSize === sz.size;
            return (
              <button
                key={sz.size}
                type="button"
                disabled={!sz.available || Boolean(addingSize)}
                onClick={(e) => handleSizeQuickAdd(e, sz.size)}
                aria-label={
                  sz.available
                    ? `Quick add size ${sz.size} to bag`
                    : `Size ${sz.size} sold out`
                }
                title={sz.available ? `Quick add ${sz.size} to bag` : `${sz.size} sold out`}
                className={`min-w-[30px] h-7 px-1.5 text-[11px] font-mono rounded-xs border transition-transform duration-160 ease-out active:scale-[0.95] flex items-center justify-center focus-dark ${
                  !sz.available
                    ? 'border-cocoa/15 text-muted-taupe/35 bg-transparent line-through cursor-not-allowed'
                    : isJustAdded
                    ? 'border-emerald-700 bg-emerald-700 text-warm-white font-bold'
                    : isAdding
                    ? 'border-ink-black bg-ink-black text-warm-white'
                    : 'border-cocoa/30 bg-warm-white text-ink-black hover:border-ink-black hover:bg-espresso hover:text-warm-white'
                }`}
              >
                {isAdding ? (
                  <span className="w-2.5 h-2.5 border-2 border-warm-white border-t-transparent rounded-full animate-spin" />
                ) : isJustAdded ? (
                  <Check className="w-3 h-3" />
                ) : (
                  sz.size.replace('EU ', '')
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Card Footer: Always-visible price and action */}
      <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-3 border-t border-cocoa/15 flex items-center justify-between">
        {/* Price (Never hidden or hover-gated) */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-ink-black font-mono tabular-nums">
              {formattedPrice}
            </span>
            {formattedComparePrice && (
              <span className="text-xs text-muted-taupe line-through font-mono tabular-nums">
                {formattedComparePrice}
              </span>
            )}
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-taupe block mt-0.5">
            Launch pricing
          </span>
        </div>

        {/* Direct Link */}
        <Link
          href={`/shop/${product.slug}`}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-cocoa hover:text-ink-black underline underline-offset-4 focus-dark p-1.5 transition-colors"
          aria-label={`View details for ${product.name}`}
        >
          <span>View Pair</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
