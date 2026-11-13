'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/commerce';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const primaryImage = product.images[0] || {
    src: '/images/products/the-twist.jpg',
    alt: product.name,
  };

  const isLowStock = product.stock > 0 && product.stock <= 3;

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
    <article className="group bg-warm-white border border-cocoa/15 rounded-xl overflow-hidden shadow-apple-sm hover:shadow-apple-md hover:border-cocoa/35 transition-[border-color,box-shadow,transform] duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.99]">
      <Link
        href={`/shop/${product.slug}`}
        className="flex flex-col h-full focus-dark"
        aria-label={`Discover ${product.name} - ${formattedPrice}`}
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
            className="object-cover hover-image-zoom"
          />
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

            {isLowStock && (
              <p className="font-editorial italic text-sm text-cocoa">
                {product.stock} {product.stock === 1 ? 'pair' : 'pairs'} remaining
              </p>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
