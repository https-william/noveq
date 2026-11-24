'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  Undo2,
  Heart,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/lib/analytics';
import { formatCompactInternationalSize } from '@/config/sizing';
import { useBlackFriday } from '@/hooks/useBlackFriday';
import { BLACK_FRIDAY_DISCOUNT_RATE } from '@/config/blackFriday';

export default function BagPage() {
  const {
    cartItems,
    removeFromCart,
    restoreLastRemoved,
    lastRemovedItem,
    dismissUndo,
    updateQuantity,
    totalItems,
    subtotal,
  } = useCart();

  const { isLive, isPreview } = useBlackFriday();
  const discountAmount = isLive ? Math.round(subtotal * BLACK_FRIDAY_DISCOUNT_RATE) : 0;
  const finalSubtotal = Math.max(0, subtotal - discountAmount);

  useEffect(() => {
    trackEvent('view_cart', {
      currency: 'NGN',
      value: subtotal,
      items_count: totalItems,
    });
  }, [subtotal, totalItems]);

  const formattedSubtotal = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(subtotal);

  const hasUnavailableItems = cartItems.some(
    (item) => Boolean(item.product.restocking) || item.product.stock <= 0
  );

  return (
    <div className="py-10 sm:py-16 lg:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="pb-6 border-b border-cocoa/20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block mb-1.5">
            Drop 001 · Lagos Studio
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[2.75rem] font-normal tracking-[-0.015em] text-ink-black leading-tight">
            Your Bag ({totalItems})
          </h1>
        </div>
        <Link
          href="/shop"
          className="text-xs uppercase tracking-[0.16em] text-cocoa hover:text-ink-black underline underline-offset-4 inline-flex items-center gap-1.5 py-1.5 self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Undo Banner */}
      {lastRemovedItem && (
        <div className="my-6 p-4 bg-warm-white border border-cocoa/25 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-ink-black">
            Removed <strong>{lastRemovedItem.product.name}</strong> ({lastRemovedItem.selectedSize})
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={restoreLastRemoved}
              className="inline-flex items-center gap-1 font-semibold text-cocoa hover:text-ink-black underline underline-offset-2 py-1"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Restore Pair</span>
            </button>
            <button
              type="button"
              onClick={dismissUndo}
              className="text-muted-taupe hover:text-ink-black text-xs py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Restocking / Unavailable Notice */}
      {hasUnavailableItems && (
        <div
          role="alert"
          className="my-6 p-4 bg-oxblood/10 border border-oxblood/30 rounded-xl flex items-start gap-3 text-xs text-oxblood"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-semibold">A silhouette in your bag is currently restocking.</p>
            <p className="leading-relaxed">
              Please remove the paused pair below to continue with checkout, or explore The Weave which is open for orders today.
            </p>
          </div>
        </div>
      )}

      {/* Cart Content */}
      {cartItems.length === 0 ? (
        <div className="py-16 sm:py-20 text-center space-y-5 bg-warm-white border border-cocoa/20 rounded-2xl p-6 sm:p-10 mt-8 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-full bg-bone border border-cocoa/25 flex items-center justify-center text-muted-taupe">
            <ShoppingBag className="w-6 h-6 stroke-[1.3]" />
          </div>
          <div className="space-y-2">
            <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-ink-black">
              Your bag is empty
            </h2>
            <p className="text-xs sm:text-sm text-muted-taupe max-w-md mx-auto leading-relaxed">
              The Weave Slide Pam is handcrafted to order across EU 34–44 in soft natural leather, with tracked nationwide delivery.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-ink-black text-warm-white text-xs uppercase tracking-[0.18em] font-semibold rounded-full hover:bg-espresso transition-[background-color,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] focus-dark min-h-[48px] shadow-apple-sm active:scale-[0.98]"
            >
              <span>Explore Drop 001</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Item List */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <div className="bg-warm-white border border-cocoa/20 rounded-2xl divide-y divide-cocoa/15 shadow-xs overflow-hidden">
              {cartItems.map((item) => {
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
                    className="p-4 sm:p-6 flex gap-4 sm:gap-5 items-start"
                  >
                    <Link
                      href={`/shop/${item.product.slug}`}
                      className="relative w-22 h-28 sm:w-28 sm:h-32 bg-bone border border-cocoa/20 rounded-xl shrink-0 overflow-hidden"
                    >
                      <Image
                        src={thumbSrc}
                        alt={item.product.name}
                        fill
                        sizes="(max-width: 640px) 88px, 112px"
                        className={thumbSrc.endsWith('.svg') ? 'object-contain p-2' : 'object-cover'}
                      />
                    </Link>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/shop/${item.product.slug}`}
                            className="font-editorial text-lg sm:text-xl font-normal text-ink-black hover:text-espresso transition-colors block truncate"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-muted-taupe mt-0.5">
                            Colour: <span className="font-medium text-ink-black">{item.selectedColour || item.product.colour}</span>
                          </p>
                          <p className="text-xs text-muted-taupe mt-0.5">
                            Size: <span className="font-medium text-ink-black">{formatCompactInternationalSize(item.selectedSize)}</span>
                          </p>
                          {isItemRestocking && (
                            <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-bone border border-cocoa/25 rounded-full text-[10px] uppercase tracking-[0.16em] text-oxblood font-semibold">
                              Restocking Soon
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.slug, item.selectedSize, item.selectedColour)}
                          aria-label={`Remove ${item.product.name} from bag`}
                          className="text-muted-taupe hover:text-oxblood transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full shrink-0 -mr-2 -mt-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {item.withHeartCharm && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-bone border border-cocoa/25 text-[11px] text-cocoa rounded-full font-medium">
                          <Heart className="w-3 h-3 fill-oxblood text-oxblood shrink-0" />
                          <span>
                            Heart charm{item.engravedText ? ` · ${item.engravedText}` : ''}
                          </span>
                        </div>
                      )}

                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
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
                            aria-label="Decrease quantity"
                            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-sm font-semibold text-ink-black hover:bg-cocoa/10 transition-colors focus-dark"
                          >
                            -
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-ink-black min-w-[28px] text-center tabular-nums">
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
                            aria-label="Increase quantity"
                            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-sm font-semibold text-ink-black hover:bg-cocoa/10 transition-colors focus-dark"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-base font-semibold text-ink-black tabular-nums">
                          ₦{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Complimentary Maison Inclusions */}
            <div className="p-4 sm:p-5 bg-bone/70 border border-cocoa/15 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-espresso">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-cocoa shrink-0" aria-hidden="true" />
                <span>Every order includes a breathable cotton dust bag and Drop 001 Edition Record.</span>
              </div>
              <Link href="/care" className="text-cocoa hover:text-ink-black underline underline-offset-4 shrink-0 font-medium">
                Care Guide
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4 bg-warm-white border border-cocoa/20 rounded-2xl p-6 space-y-5 shadow-xs lg:sticky lg:top-28">
            <div className="border-b border-cocoa/15 pb-3.5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-cocoa font-medium block mb-1">
                Lagos Studio
              </span>
              <h2 className="font-editorial text-2xl font-normal text-ink-black">
                Order Summary
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-muted-taupe">
                <span>{isLive ? 'Pairs Regular Total' : 'Items Subtotal'}</span>
                <span className="font-semibold text-ink-black tabular-nums">{formattedSubtotal}</span>
              </div>

              {isLive && (
                <div className="flex justify-between text-cocoa font-medium">
                  <span>
                    24-Hour Edit (25% Off Pairs){isPreview ? ' · Preview' : ''}
                  </span>
                  <span className="tabular-nums">-₦{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-taupe">
                <span>Delivery{isLive ? ' (Standard Rate · Excluded)' : ''}</span>
                <span className="text-cocoa font-medium">Calculated at checkout</span>
              </div>

              <div className="pt-3.5 border-t border-cocoa/15 flex justify-between items-baseline text-sm">
                <span className="font-semibold text-ink-black uppercase tracking-[0.14em] text-xs">
                  Estimated Pairs Total
                </span>
                <span className="text-xl font-semibold text-ink-black tabular-nums">
                  ₦{(isLive ? finalSubtotal : subtotal).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-1">
              {hasUnavailableItems ? (
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center justify-center py-4 px-6 bg-bone text-muted-taupe border border-cocoa/25 text-xs uppercase tracking-[0.18em] font-semibold rounded-full min-h-[50px] cursor-not-allowed"
                >
                  Remove Restocking Pair Above
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
                  }}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-ink-black text-warm-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-espresso transition-[background-color,transform,box-shadow] duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] rounded-full focus-dark min-h-[50px] shadow-apple-md hover:shadow-apple-lg active:scale-[0.98]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            <div className="pt-2 border-t border-cocoa/10 space-y-2 text-[11px] text-muted-taupe">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-cocoa shrink-0" aria-hidden="true" />
                <span>5 days benchcraft + 2 days tracked courier delivery.</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-cocoa shrink-0" aria-hidden="true" />
                <span>Paystack secure checkout · Individually checked in Lagos.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
