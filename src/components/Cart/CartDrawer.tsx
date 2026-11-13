'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Undo2,
  Heart,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/lib/analytics';
import { formatCompactInternationalSize } from '@/config/sizing';

export default function CartDrawer() {
  const {
    cartItems,
    isDrawerOpen,
    closeDrawer,
    removeFromCart,
    restoreLastRemoved,
    lastRemovedItem,
    dismissUndo,
    updateQuantity,
    totalItems,
    subtotal,
  } = useCart();

  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
      closeBtnRef.current?.focus();

      trackEvent('view_cart', {
        currency: 'NGN',
        value: subtotal,
        items_count: totalItems,
      });

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeDrawer();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isDrawerOpen, closeDrawer, subtotal, totalItems]);

  if (!isDrawerOpen) return null;

  const formattedSubtotal = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(subtotal);

  const hasUnavailableItems = cartItems.some(
    (item) => Boolean(item.product.restocking) || item.product.stock <= 0
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag"
      className="fixed inset-0 z-50 flex justify-end items-end sm:items-stretch bg-ink-black/60 backdrop-blur-xs transition-opacity duration-200"
    >
      {/* Backdrop click to dismiss */}
      <div
        className="absolute inset-0"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Desktop: Slide-in drawer from right. Mobile: Bottom-sheet */}
      <div className="relative z-10 w-full sm:max-w-md bg-warm-white text-ink-black border-t sm:border-t-0 sm:border-l border-cocoa/25 rounded-t-2xl sm:rounded-none flex flex-col max-h-[90dvh] sm:max-h-full h-auto sm:h-full shadow-2xl overflow-hidden transition-transform duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)]">
        {/* Mobile drag handle */}
        <div className="sm:hidden w-10 h-1 bg-cocoa/25 rounded-full mx-auto mt-3 mb-0.5" />

        {/* Drawer Header */}
        <div className="px-5 sm:px-6 py-4 flex items-center justify-between border-b border-cocoa/15 bg-bone/50">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-cocoa" aria-hidden="true" />
            <div>
              <h2 className="font-editorial text-lg sm:text-xl font-normal text-ink-black leading-none">
                Your Bag
              </h2>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-taupe block mt-1 tabular-nums">
                {totalItems} {totalItems === 1 ? 'Pair' : 'Pairs'} · Drop 001
              </span>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={closeDrawer}
            aria-label="Close shopping bag drawer"
            className="p-2 text-muted-taupe hover:text-ink-black transition-colors rounded-full focus-dark min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Delivery Note Banner */}
        <div className="px-5 sm:px-6 py-2.5 bg-espresso text-warm-white text-[10px] sm:text-[11px] uppercase tracking-[0.16em] flex items-center justify-between gap-2">
          <span>Handcrafted in Lagos</span>
          <span className="text-muted-taupe-on-dark font-medium shrink-0">7 Business Days Delivery</span>
        </div>

        {/* Restore After Remove (Undo) Banner */}
        {lastRemovedItem && (
          <div className="px-5 sm:px-6 py-3 bg-bone border-b border-cocoa/20 flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-ink-black font-medium">
              Removed {lastRemovedItem.product.name} ({lastRemovedItem.selectedSize})
            </span>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={restoreLastRemoved}
                aria-label={`Restore ${lastRemovedItem.product.name} to bag`}
                className="inline-flex items-center gap-1 font-semibold text-cocoa hover:text-ink-black underline underline-offset-2 py-1"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>
              <button
                type="button"
                onClick={dismissUndo}
                aria-label="Dismiss undo notification"
                className="text-muted-taupe hover:text-ink-black p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Unavailable / Restocking Notice */}
        {hasUnavailableItems && (
          <div
            role="alert"
            className="mx-5 sm:mx-6 mt-4 p-3.5 bg-oxblood/10 border border-oxblood/25 rounded-xl flex items-start gap-2.5 text-xs text-oxblood"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="leading-relaxed">
              One or more pairs in your bag are currently restocking. Please remove paused pairs to proceed with checkout.
            </p>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 divide-y divide-cocoa/15">
          {cartItems.length === 0 ? (
            <div className="py-12 sm:py-16 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-bone border border-cocoa/20 flex items-center justify-center text-muted-taupe">
                <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5">
                <p className="font-editorial text-xl text-ink-black">Your bag is empty.</p>
                <p className="text-xs text-muted-taupe max-w-xs mx-auto leading-relaxed">
                  Explore The Weave — handcrafted in Lagos from soft natural leather and open for orders today.
                </p>
              </div>
              <Link
                href="/shop"
                onClick={closeDrawer}
                className="inline-flex items-center gap-2 px-6 py-3 bg-ink-black text-warm-white text-xs uppercase tracking-[0.16em] font-medium rounded-full hover:bg-espresso transition-[background-color,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] shadow-apple-sm active:scale-[0.97] min-h-[44px]"
              >
                <span>Discover Drop 001</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            cartItems.map((item) => {
              const matchedColour = item.product.colours?.find(
                (c) => c.name === (item.selectedColour || item.product.colour)
              );
              const thumbSrc =
                matchedColour?.imageSrc ||
                item.product.images[0]?.src ||
                '/images/products/the-weave-black.jpg';
              const isItemRestocking =
                Boolean(item.product.restocking) || item.product.stock <= 0;

              return (
                <div
                  key={`${item.product.slug}-${item.selectedSize}-${item.selectedColour || ''}`}
                  className="py-4 flex gap-3.5 sm:gap-4 items-start"
                >
                  {/* Thumbnail */}
                  <Link
                    href={`/shop/${item.product.slug}`}
                    onClick={closeDrawer}
                    className="relative w-20 h-24 bg-bone border border-cocoa/20 rounded-xl shrink-0 overflow-hidden"
                  >
                    <Image
                      src={thumbSrc}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      className={thumbSrc.endsWith('.svg') ? 'object-contain p-1.5' : 'object-cover'}
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/shop/${item.product.slug}`}
                          onClick={closeDrawer}
                          className="font-editorial text-base text-ink-black hover:text-espresso transition-colors truncate block"
                        >
                          {item.product.name}
                        </Link>
                        {isItemRestocking && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 bg-bone border border-cocoa/25 rounded-full text-[9px] uppercase tracking-[0.16em] text-oxblood font-semibold">
                            Restocking Soon
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(item.product.slug, item.selectedSize, item.selectedColour)
                        }
                        aria-label={`Remove ${item.product.name} from bag`}
                        className="text-muted-taupe hover:text-oxblood transition-colors p-1.5 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full shrink-0 -mr-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-muted-taupe mt-1 leading-snug">
                      {item.selectedColour || item.product.colour}
                      <span className="mx-1.5">·</span>
                      <span className="text-ink-black font-medium">
                        {formatCompactInternationalSize(item.selectedSize)}
                      </span>
                    </p>

                    {item.withHeartCharm && (
                      <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 bg-bone border border-cocoa/25 text-[11px] text-cocoa rounded-full font-medium">
                        <Heart className="w-3 h-3 fill-oxblood text-oxblood shrink-0" />
                        <span>
                          Heart charm{item.engravedText ? ` · ${item.engravedText}` : ''}
                        </span>
                      </div>
                    )}

                    {/* Quantity & Item Subtotal */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="inline-flex items-center border border-cocoa/30 rounded-full bg-bone/60 overflow-hidden">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.product.slug,
                              item.selectedSize,
                              item.quantity - 1,
                              item.selectedColour
                            )
                          }
                          aria-label={`Decrease quantity of ${item.product.name} size ${item.selectedSize}`}
                          className="w-9 h-9 flex items-center justify-center text-sm font-semibold text-ink-black hover:bg-cocoa/15 transition-colors focus-dark"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-semibold text-ink-black min-w-[26px] text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.product.slug,
                              item.selectedSize,
                              item.quantity + 1,
                              item.selectedColour
                            )
                          }
                          aria-label={`Increase quantity of ${item.product.name} size ${item.selectedSize}`}
                          className="w-9 h-9 flex items-center justify-center text-sm font-semibold text-ink-black hover:bg-cocoa/15 transition-colors focus-dark"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-semibold text-ink-black tabular-nums">
                        ₦{(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer / Checkout CTA */}
        {cartItems.length > 0 && (
          <div className="p-5 sm:p-6 border-t border-cocoa/20 bg-bone/50 space-y-3.5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center gap-2 text-[11px] text-cocoa">
              <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Includes cotton dust bag &amp; Drop 001 Edition Record</span>
            </div>

            <div className="flex justify-between items-baseline text-sm pt-1 border-t border-cocoa/15">
              <span className="text-xs uppercase tracking-[0.16em] text-muted-taupe font-medium">
                Subtotal
              </span>
              <span className="text-lg font-semibold text-ink-black tabular-nums">
                {formattedSubtotal}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {hasUnavailableItems ? (
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center justify-center py-3.5 px-6 bg-bone text-muted-taupe border border-cocoa/25 text-xs uppercase tracking-[0.18em] font-semibold rounded-full min-h-[48px] cursor-not-allowed"
                >
                  Remove Restocking Pair to Checkout
                </button>
              ) : (
                <Link
                  href="/checkout"
                  onClick={() => {
                    trackEvent('begin_checkout', {
                      currency: 'NGN',
                      value: subtotal,
                      items_count: totalItems,
                    });
                    closeDrawer();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-ink-black text-warm-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-espresso transition-[background-color,transform,box-shadow] duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] rounded-full focus-dark min-h-[48px] shadow-apple-md hover:shadow-apple-lg active:scale-[0.97] cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <div className="flex items-center justify-between pt-1">
                <Link
                  href="/bag"
                  onClick={closeDrawer}
                  className="py-2 text-xs uppercase tracking-[0.14em] text-cocoa hover:text-ink-black underline underline-offset-4 transition-colors"
                >
                  View Full Bag
                </Link>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="py-2 text-xs uppercase tracking-[0.14em] text-muted-taupe hover:text-ink-black transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
