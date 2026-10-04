'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Trash2, Undo2, Heart, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/lib/analytics';

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

  return (
    <div className="py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="pb-6 border-b border-cocoa/20 flex items-baseline justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block mb-1">
            Shopping Bag
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink-black">
            Review Bag ({totalItems})
          </h1>
        </div>
        <Link
          href="/shop"
          className="text-xs uppercase tracking-[0.16em] text-cocoa hover:text-ink-black underline underline-offset-4 hidden sm:inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Undo Banner */}
      {lastRemovedItem && (
        <div className="my-6 p-4 bg-warm-white border border-cocoa/30 rounded-xs flex items-center justify-between text-xs">
          <span className="text-ink-black">
            Removed <strong>{lastRemovedItem.product.name}</strong> ({lastRemovedItem.selectedSize})
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={restoreLastRemoved}
              className="inline-flex items-center gap-1 font-semibold text-cocoa hover:text-ink-black underline underline-offset-2"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Restore Item</span>
            </button>
            <button
              type="button"
              onClick={dismissUndo}
              className="text-muted-taupe hover:text-ink-black text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Cart Content */}
      {cartItems.length === 0 ? (
        <div className="py-20 text-center space-y-5 bg-warm-white border border-cocoa/20 rounded-sm p-8 mt-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-bone border border-cocoa/25 flex items-center justify-center text-muted-taupe">
            <ShoppingBag className="w-6 h-6 stroke-[1.2]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-ink-black">Your bag is currently empty</h2>
            <p className="text-xs sm:text-sm text-muted-taupe max-w-md mx-auto leading-relaxed">
              Drop 001 introduces NOVEQ through an initial run of 10 pairs of women’s leather pams.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-ink-black text-warm-white text-xs uppercase tracking-[0.18em] font-medium rounded-xs hover:bg-espresso transition-colors focus-dark min-h-[44px]"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Item List */}
          <div className="lg:col-span-8 bg-warm-white border border-cocoa/20 rounded-sm divide-y divide-cocoa/15">
            {cartItems.map((item) => (
              <div
                key={`${item.product.slug}-${item.selectedSize}-${item.selectedColour || ''}`}
                className="p-6 flex flex-col sm:flex-row gap-5 items-start"
              >
                <div className="relative w-24 h-24 bg-bone border border-cocoa/20 rounded-xs shrink-0 overflow-hidden">
                  <Image
                    src={item.product.images[0]?.src || '/images/models/the-ring-hero-model.jpg'}
                    alt={item.product.name}
                    fill
                    sizes="96px"
                    className="object-contain p-2"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-base font-semibold text-ink-black">
                        {item.product.name}
                      </h2>
                      <p className="text-xs text-muted-taupe">
                        Size: <span className="font-semibold text-ink-black">{item.selectedSize}</span> · Colour: <span className="font-semibold text-ink-black">{item.selectedColour || item.product.colour}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.slug, item.selectedSize, item.selectedColour)}
                      aria-label={`Remove ${item.product.name} from bag`}
                      className="text-muted-taupe hover:text-oxblood transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {item.withHeartCharm && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-bone border border-cocoa/25 text-[11px] text-cocoa rounded-xs font-medium">
                      <Heart className="w-3 h-3 fill-oxblood text-oxblood shrink-0" />
                      <span>
                        Heart charm{item.engravedText ? ` — engraved '${item.engravedText}'` : ''}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between">
                    <div className="inline-flex items-center border border-cocoa/30 rounded-xs bg-bone/60">
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
                        className="px-3 py-1 text-xs font-semibold text-ink-black hover:bg-cocoa/10"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-bold text-ink-black min-w-[28px] text-center">
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
                        className="px-3 py-1 text-xs font-semibold text-ink-black hover:bg-cocoa/10"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-sm font-bold text-ink-black">
                      ₦{(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 bg-warm-white border border-cocoa/20 rounded-sm p-6 space-y-5">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-ink-black border-b border-cocoa/15 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-muted-taupe">
                <span>Items Subtotal</span>
                <span className="font-semibold text-ink-black">{formattedSubtotal}</span>
              </div>

              <div className="flex justify-between text-muted-taupe">
                <span>Delivery</span>
                <span className="text-cocoa font-medium">Pay rider on delivery</span>
              </div>

              <div className="pt-3 border-t border-cocoa/15 flex justify-between text-sm">
                <span className="font-bold text-ink-black">Total (Online)</span>
                <span className="font-bold text-ink-black">{formattedSubtotal}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/checkout"
                onClick={() => {
                  trackEvent('begin_checkout', {
                    currency: 'NGN',
                    value: subtotal,
                    items_count: totalItems,
                  });
                }}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-ink-black text-warm-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-espresso transition-colors rounded-xs focus-dark min-h-[48px]"
              >
                <span>Proceed to Guest Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-[11px] text-muted-taupe leading-relaxed text-center">
              Guest checkout available. No account creation required.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
