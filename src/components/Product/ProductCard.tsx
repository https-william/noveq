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
  const { isLive, isPreview, getUnitPrice } = useBlackFriday();
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

  const formattedComparePrice = isLive
    ? formattedRegularPrice
    : product.compare_at_price
    ? formatNaira(product.compare_at_price)
    : null;

  return (
    <article className="group p-1.5 rounded-[22px] bg-warm-white border border-cocoa/10 hover:border-cocoa/25 transition-[border-color,box-shadow,transform] duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_2px_10px_-4px_rgba(42,27,21,0.06)] hover:shadow-[0_12px_30px_-10px_rgba(42,27,21,0.12)] active:scale-[0.99]">
      <Link
        href={`/shop/${product.slug}`}
        className="flex flex-col h-full focus-dark rounded-[16px]"
        aria-label={`Discover ${product.name} - ${formattedPrice}${isRestocking ? ' (Restocking Soon)' : ''}`}
      >
        {/* Sculpted Double-Bezel Photography Frame */}
        <div className="relative aspect-[4/5] w-full rounded-[16px] bg-[#F4F0E8] border border-cocoa/8 overflow-hidden">
          <Image
            src={primaryImage.src}
            alt={primaryImage.alt}
            fill
            priority={priority}
            unoptimized={primaryImage.src.startsWith('data:')}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.035] ${isRestocking ? 'opacity-90' : ''}`}
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
