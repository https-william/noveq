'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/commerce';
import { useBlackFriday } from '@/hooks/useBlackFriday';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { isLive, isPreview, getUnitPrice } = useBlackFriday();
  const colours = product.colours ?? [];
  const hasMultipleColours = colours.length > 1;

  const [selectedColourIndex, setSelectedColourIndex] = useState(0);
  const activeColour = hasMultipleColours ? colours[selectedColourIndex] ?? colours[0] : null;

  const fallbackImage = product.images[0] || {
    src: '/images/products/the-twist.jpg',
    alt: product.name,
  };

  const activeImageSrc = activeColour?.imageSrc || fallbackImage.src;
  const activeImageAlt = activeColour
    ? `${product.name} in ${activeColour.name}`
    : fallbackImage.alt;

  const isRestocking =
    Boolean(product.restocking) ||
    product.stock <= 0 ||
    product.sizes.every((s) => !s.available);
  const isLowStock = !isRestocking && product.stock > 0 && product.stock <= 3;

  const bfUnitPrice = getUnitPrice(product.price);
  const displayPrice = isLive ? bfUnitPrice : product.price;

  const formatNaira = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: product.currency,
      maximumFractionDigits: 0,
    }).format(amount);

  const formattedPrice = formatNaira(displayPrice);
  const formattedRegularPrice = formatNaira(product.price);

  const formattedComparePrice = isLive
    ? formattedRegularPrice
    : product.compare_at_price
    ? formatNaira(product.compare_at_price)
    : null;

  const productHref =
    activeColour && selectedColourIndex > 0
      ? `/shop/${product.slug}?colour=${encodeURIComponent(activeColour.name)}`
      : `/shop/${product.slug}`;

  const handleColourHover = (idx: number) => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      setSelectedColourIndex(idx);
    }
  };

  return (
    <article className="group flex flex-col h-full p-1.5 rounded-[22px] bg-warm-white border border-cocoa/10 hover:border-cocoa/25 transition-[border-color,box-shadow] duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_2px_10px_-4px_rgba(42,27,21,0.06)] hover:shadow-[0_12px_30px_-10px_rgba(42,27,21,0.12)]">
      {/* Sculpted Double-Bezel Photography Frame */}
      <Link
        href={productHref}
        className="group/photo relative block aspect-[4/5] w-full rounded-[16px] bg-[#F4F0E8] border border-cocoa/8 overflow-hidden focus-dark"
        aria-label={`Discover ${product.name}${activeColour ? ` in ${activeColour.name}` : ''} - ${formattedPrice}${isRestocking ? ' (Restocking Soon)' : ''}`}
      >
        <Image
          src={activeImageSrc}
          alt={activeImageAlt}
          fill
          priority={priority}
          quality={90}
          unoptimized={activeImageSrc.startsWith('data:')}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)]:group-hover/photo:scale-[1.03] ${isRestocking ? 'opacity-90' : ''}`}
        />
        {isRestocking && (
          <span className="absolute top-3.5 left-3.5 px-3 py-1 bg-warm-white/95 border border-cocoa/25 rounded-full text-[10px] uppercase tracking-[0.18em] text-espresso font-medium shadow-xs">
            Restocking Soon
          </span>
        )}
        {!isRestocking && isLive && (
          <span className="absolute top-3.5 right-3.5 px-2.5 py-1 bg-warm-white/95 border border-cocoa/20 rounded-full text-[10px] text-espresso font-medium">
            24-Hour Edit · 25% off{isPreview ? ' (Preview)' : ''}
          </span>
        )}
      </Link>

      {/* Poised Centered Maison Details */}
      <div className="flex-1 px-6 pt-6 pb-7 sm:px-7 sm:pt-7 sm:pb-8 flex flex-col items-center justify-between text-center gap-4">
        <div className="w-full space-y-2.5">
          <Link
            href={productHref}
            className="inline-block focus-dark rounded-sm"
          >
            <h3 className="font-editorial font-normal text-ink-black text-[1.375rem] sm:text-2xl tracking-[-0.01em] leading-snug [@media(hover:hover)]:hover:text-espresso transition-colors duration-[180ms]">
              {product.name}
            </h3>
          </Link>

          {/* Interactive Leather Swatch Rail + Quiet Colour Count */}
          {hasMultipleColours ? (
            <div className="flex flex-col items-center gap-1.5">
              <div
                role="radiogroup"
                aria-label={`Available colours for ${product.name}`}
                className="inline-flex items-center justify-center gap-0.5"
              >
                {colours.map((colour, idx) => {
                  const isSelected = idx === selectedColourIndex;
                  return (
                    <button
                      key={colour.name}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${colour.name} colourway`}
                      title={colour.name}
                      onClick={() => setSelectedColourIndex(idx)}
                      onMouseEnter={() => handleColourHover(idx)}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                          e.preventDefault();
                          setSelectedColourIndex((idx + 1) % colours.length);
                        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                          e.preventDefault();
                          setSelectedColourIndex((idx - 1 + colours.length) % colours.length);
                        }
                      }}
                      className="w-9 h-9 sm:w-7 sm:h-7 rounded-full flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-black focus-visible:ring-offset-1 focus-visible:ring-offset-warm-white transition-transform duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.90]"
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full border border-ink-black/20 transition-[transform,box-shadow] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
                          isSelected
                            ? 'ring-1 ring-ink-black ring-offset-2 ring-offset-warm-white scale-100'
                            : '[@media(hover:hover)]:hover:scale-110'
                        }`}
                        style={{ backgroundColor: colour.hex }}
                      />
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-muted-taupe font-normal leading-snug tabular-nums">
                <span className="text-espresso">{activeColour?.name}</span>
                <span className="mx-1.5 text-cocoa/45" aria-hidden="true">·</span>
                <span>{colours.length} colours</span>
                {product.charm_option.supported ? (
                  <>
                    <span className="mx-1.5 text-cocoa/45" aria-hidden="true">·</span>
                    <span>Optional Charm</span>
                  </>
                ) : null}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-taupe font-normal leading-snug">
              {product.colour}
              {product.charm_option.supported ? ' · Optional Charm' : ''}
            </p>
          )}
        </div>

        <Link
          href={productHref}
          className="pt-0.5 space-y-1 focus-dark rounded-sm"
        >
          <div className="flex items-baseline justify-center gap-2.5">
            <span className="text-[15px] font-medium text-ink-black tracking-wide tabular-nums">
              {formattedPrice}
            </span>
            {formattedComparePrice && (
              <span className="text-xs text-muted-taupe/75 line-through tabular-nums">
                {formattedComparePrice}
              </span>
            )}
          </div>

          {isRestocking ? (
            <p className="font-editorial italic text-sm text-muted-taupe">
              Restocking soon
            </p>
          ) : (
            isLowStock && (
              <p className="font-editorial italic text-sm text-cocoa">
                {product.stock} {product.stock === 1 ? 'pair' : 'pairs'} remaining
              </p>
            )
          )}
        </Link>
      </div>
    </article>
  );
}
