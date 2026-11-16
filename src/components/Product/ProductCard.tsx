'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/commerce';
import { useBlackFriday } from '@/hooks/useBlackFriday';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { phase, isLive, isPreview, getUnitPrice } = useBlackFriday();
  const primaryImage = product.images[0] || {
    src: '/images/products/the-twist.jpg',
    alt: product.name,
  };

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
  const formattedBfUpcomingPrice = formatNaira(bfUnitPrice);

  const formattedComparePrice = isLive
    ? formattedRegularPrice
    : product.compare_at_price
    ? formatNaira(product.compare_at_price)
    : null;

  return (
    <article className="group bg-warm-white border border-cocoa/15 rounded-xl overflow-hidden shadow-apple-sm hover:shadow-apple-md hover:border-cocoa/35 transition-[border-color,box-shadow,transform] duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.99]">
      <Link
        href={`/shop/${product.slug}`}
        className="flex flex-col h-full focus-dark"
        aria-label={`Discover ${product.name} - ${formattedPrice}${isRestocking ? ' (Restocking Soon)' : ''}`}
      >
        {/* Unadorned Gallery Image Stage */}
        <div className="relative aspect-[4/5] w-full bg-[#F4F0E8] border-b border-cocoa/10 overflow-hidden">
          <Image
            src={primaryImage.src}
            alt={primaryImage.alt}
            fill
            priority={priority}
            unoptimized={primaryImage.src.startsWith('data:')}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover hover-image-zoom ${isRestocking ? 'opacity-90' : ''}`}
          />
          {isRestocking && (
            <span className="absolute top-3.5 left-3.5 px-3 py-1 bg-warm-white/95 border border-cocoa/25 rounded-full text-[10px] uppercase tracking-[0.18em] text-espresso font-medium shadow-xs">
              Restocking Soon
            </span>
          )}
          {!isRestocking && isLive && (
            <span className="absolute top-3.5 right-3.5 px-2.5 py-1 bg-[#111111]/95 border border-[#b89b72]/50 rounded-full text-[10px] uppercase tracking-[0.16em] text-[#b89b72] font-semibold shadow-xs">
              25% Off{isPreview ? ' · Preview' : ''}
            </span>
          )}
        </div>

        {/* Poised Centered Maison Details */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col items-center justify-between text-center space-y-4">
          <div className="space-y-1.5">
            <h3 className="font-editorial font-normal text-ink-black text-[1.375rem] sm:text-2xl tracking-[-0.01em] leading-snug group-hover:text-espresso transition-colors duration-[180ms]">
              {product.name}
            </h3>
            <p className="text-sm text-muted-taupe font-normal leading-snug">
              {product.colour}
              {product.charm_option.supported ? ' · Optional Charm' : ''}
            </p>
          </div>

          <div className="pt-1 space-y-1">
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

            {!isRestocking && isLive && (
              <p className="text-[11px] uppercase tracking-[0.14em] text-cocoa font-medium">
                24-Hour Edit · Excludes delivery
              </p>
            )}

            {!isRestocking && !isLive && phase === 'upcoming' && (
              <p className="text-[11px] text-cocoa font-medium">
                Nov 27 price: {formattedBfUpcomingPrice} (25% off pair)
              </p>
            )}

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
          </div>
        </div>
      </Link>
    </article>
  );
}
