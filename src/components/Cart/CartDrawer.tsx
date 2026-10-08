'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Trash2, ArrowRight, ShoppingBag, Undo2, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/lib/analytics';

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

      // Instrument view_cart event
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag confirmation"
      className="fixed inset-0 z-50 flex justify-end items-end sm:items-stretch bg-ink-black/60 backdrop-blur-xs transition-opacity duration-200"
    >
      {/* Backdrop click to dismiss */}
      <div
        className="absolute inset-0"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Desktop: Compact slide-in drawer from right. Mobile: Bottom-sheet */}
      <div className="relative z-10 w-full sm:max-w-md bg-warm-white text-ink-black border-t sm:border-t-0 sm:border-l border-cocoa/30 rounded-t-lg sm:rounded-none flex flex-col max-h-[88vh] sm:max-h-full h-auto sm:h-full shadow-2xl overflow-hidden transition-transform duration-200">
        {/* Mobile drag handle */}
        <div className="sm:hidden w-12 h-1 bg-cocoa/30 rounded-full mx-auto mt-3 mb-1" />

        {/* Drawer Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-cocoa/15 bg-bone/40">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-cocoa" aria-hidden="true" />
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-ink-black">
              Your Bag ({totalItems})
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={closeDrawer}
            aria-label="Close shopping bag drawer"
            className="p-2 text-muted-taupe hover:text-ink-black transition-colors rounded-sm focus-dark min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Delivery Note Banner */}
        <div className="px-6 py-2.5 bg-espresso text-warm-white text-[11px] uppercase tracking-wider flex items-center justify-between">
          <span>Drop 001 Made to Order</span>
          <span className="text-muted-taupe-on-dark font-medium">Nationwide / ~7 Days</span>
        </div>

        {/* Restore After Remove (Undo) Banner - Mobile & Desktop */}
        {lastRemovedItem && (
          <div className="px-6 py-3 bg-bone border-b border-cocoa/20 flex items-center justify-between text-xs animate-in fade-in duration-150">
            <span className="truncate max-w-[220px] text-ink-black font-medium">
              Removed {lastRemovedItem.product.name} ({lastRemovedItem.selectedSize})
            </span>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={restoreLastRemoved}
                aria-label={`Restore ${lastRemovedItem.product.name} to bag`}
                className="inline-flex items-center gap-1 font-semibold text-cocoa hover:text-ink-black underline underline-offset-2"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>
              <button
                type="button"
                onClick={dismissUndo}
                aria-label="Dismiss undo notification"
                className="text-muted-taupe hover:text-ink-black p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-cocoa/15">
          {cartItems.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-bone border border-cocoa/20 flex items-center justify-center text-muted-taupe">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-ink-black">Your bag is empty.</p>
                <p className="text-xs text-muted-taupe max-w-xs mx-auto leading-relaxed">
                  Drop 001 is an initial limited release of women’s leather pams.
                </p>
              </div>
              <Link
                href="/shop"
                onClick={closeDrawer}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-ink-black text-warm-white text-xs uppercase tracking-[0.16em] font-medium rounded-xs hover:bg-espresso transition-colors"
              >
                <span>Discover Drop 001</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={`${item.product.slug}-${item.selectedSize}-${item.selectedColour || ''}`}
                className="py-4 flex gap-4 items-start"
              >
                {/* Thumbnail */}
                <div className="relative w-20 h-20 bg-espresso/30 border border-cocoa/20 rounded-xs shrink-0 overflow-hidden">
                  <Image
                    src={item.product.images[0]?.src || '/images/products/the-ring-warm-cognac.jpg'}
                    alt={item.product.name}
                    fill
                    sizes="80px"
                    className={item.product.images[0]?.src?.endsWith('.svg') ? 'object-contain p-1' : 'object-cover'}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-semibold text-ink-black truncate">
                      {item.product.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.slug, item.selectedSize, item.selectedColour)}
                      aria-label={`Remove ${item.product.name} from bag`}
                      className="text-muted-taupe hover:text-oxblood transition-colors p-2 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-muted-taupe mt-0.5">
                    Size: <span className="font-semibold text-ink-black">{item.selectedSize}</span> · Colour: <span className="font-semibold text-ink-black">{item.selectedColour || item.product.colour}</span>
                  </p>

                  {/* Line Item Charm / Personalisation Display */}
                  {item.withHeartCharm && (
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 bg-bone border border-cocoa/25 text-[11px] text-cocoa rounded-xs font-medium">
                      <Heart className="w-3 h-3 fill-oxblood text-oxblood shrink-0" />
                      <span>
                        Heart charm{item.engravedText ? ` - engraved '${item.engravedText}'` : ''}
                      </span>
                    </div>
                  )}

                  {/* Quantity & Item Subtotal */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="inline-flex items-center border border-cocoa/30 rounded-xs bg-bone/60 overflow-hidden">
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
                      <span className="px-2 text-xs font-semibold text-ink-black min-w-[28px] text-center font-mono tabular-nums">
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

                    <span className="text-xs font-bold text-ink-black font-mono tabular-nums">
                      ₦{(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer / Checkout CTA */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-cocoa/20 bg-bone/40 space-y-4">
            <div className="flex justify-between items-baseline text-sm">
              <span className="text-xs uppercase tracking-[0.16em] text-muted-taupe font-medium">
                Subtotal
              </span>
              <span className="text-base font-bold text-ink-black font-mono tabular-nums">
                {formattedSubtotal}
              </span>
            </div>

            <p className="text-[11px] text-muted-taupe leading-tight">
              Delivery fee is paid directly to the dispatch rider upon delivery.
            </p>

            <div className="space-y-2 pt-2">
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
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-ink-black text-warm-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-espresso transition-colors rounded-xs focus-dark min-h-[44px]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={closeDrawer}
                className="w-full py-2 text-xs uppercase tracking-[0.16em] text-muted-taupe hover:text-ink-black transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
