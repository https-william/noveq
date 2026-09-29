'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Truck, ArrowLeft, Heart, Lock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { DELIVERY_ZONES, getDeliveryZoneById } from '@/config/deliveryZones';
import { CustomerDetails } from '@/types/commerce';
import { trackEvent } from '@/lib/analytics';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, subtotal } = useCart();

  const [formData, setFormData] = useState<CustomerDetails>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: 'Lagos',
    state: 'Lagos State',
    zoneId: 'lagos-mainland',
    deliveryNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Track begin_checkout once on mount
  useEffect(() => {
    if (cartItems.length > 0) {
      trackEvent('begin_checkout', {
        currency: 'NGN',
        value: subtotal,
        items: cartItems.map((item) => ({
          item_id: item.product.slug,
          item_name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          item_variant: `${item.selectedSize} - ${item.product.colour}`,
        })),
      });
    }
  }, [cartItems, subtotal]);

  const selectedZone = getDeliveryZoneById(formData.zoneId);
  const deliveryFee = selectedZone.fee;
  const totalAmount = subtotal + deliveryFee;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const zoneId = e.target.value;
    setFormData((prev) => ({ ...prev, zoneId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cartItems.length === 0) {
      setErrorMessage('Your bag is empty. Please select a product before checking out.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData,
          items: cartItems,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order.');
      }

      // Track payment step reached
      trackEvent('add_payment_info', {
        order_id: data.orderId,
        currency: 'NGN',
        value: totalAmount,
      });

      // Navigate to payment authorization URL
      if (data.authorizationUrl) {
        if (data.authorizationUrl.startsWith('http')) {
          window.location.href = data.authorizationUrl;
        } else {
          router.push(data.authorizationUrl);
        }
      } else {
        router.push(`/checkout/payment?orderId=${data.orderId}`);
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="py-24 max-w-xl mx-auto px-4 text-center space-y-4">
        <h1 className="text-2xl font-bold text-ink-black">Your bag is empty</h1>
        <p className="text-xs text-muted-taupe">
          Add a pair of Drop 001 leather pams to continue with checkout.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-ink-black text-warm-white text-xs uppercase tracking-widest font-semibold rounded-xs"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb / Return */}
      <div className="mb-6">
        <Link
          href="/bag"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-cocoa hover:text-ink-black transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Bag</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Guest Checkout Form (No Account Wall) */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-semibold block mb-1">
              Guest Checkout
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-black">
              Delivery & Contact Details
            </h1>
            <p className="text-xs text-muted-taupe mt-1">
              No account required. We only collect the details needed to deliver and confirm your footwear.
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              aria-live="polite"
              className="p-4 bg-oxblood/10 border border-oxblood/30 text-oxblood text-xs rounded-xs"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div className="bg-warm-white border border-cocoa/20 rounded-sm p-6 space-y-4">
              <h2 className="text-xs uppercase tracking-[0.18em] font-bold text-ink-black">
                1. Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-xs uppercase tracking-wider text-muted-taupe mb-1">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Zainab Balogun"
                    className="w-full px-3 py-2.5 bg-bone border border-cocoa/30 text-xs text-ink-black rounded-xs focus:outline-none focus:border-ink-black"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs uppercase tracking-wider text-muted-taupe mb-1">
                    Phone (Courier Contact) *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="080 1234 5678"
                    className="w-full px-3 py-2.5 bg-bone border border-cocoa/30 text-xs text-ink-black rounded-xs focus:outline-none focus:border-ink-black"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs uppercase tracking-wider text-muted-taupe mb-1">
                  Email Address (Receipt & Tracking) *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="zainab@example.com"
                  className="w-full px-3 py-2.5 bg-bone border border-cocoa/30 text-xs text-ink-black rounded-xs focus:outline-none focus:border-ink-black"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-warm-white border border-cocoa/20 rounded-sm p-6 space-y-4">
              <h2 className="text-xs uppercase tracking-[0.18em] font-bold text-ink-black">
                2. Delivery Destination
              </h2>

              {/* Delivery Zone Selector — Configurable Table */}
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label htmlFor="zoneId" className="block text-xs uppercase tracking-wider text-muted-taupe">
                    Delivery Zone & Fee *
                  </label>
                  <span className="text-[11px] text-cocoa font-medium">
                    Estimated: {selectedZone.estimatedDays}
                  </span>
                </div>
                <select
                  id="zoneId"
                  name="zoneId"
                  value={formData.zoneId}
                  onChange={handleZoneChange}
                  className="w-full px-3 py-2.5 bg-bone border border-cocoa/30 text-xs text-ink-black rounded-xs focus:outline-none focus:border-ink-black"
                >
                  {DELIVERY_ZONES.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} — ₦{zone.fee.toLocaleString()} ({zone.estimatedDays})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-taupe mt-1">
                  Coverage: {selectedZone.description}
                </p>
              </div>

              <div>
                <label htmlFor="address" className="block text-xs uppercase tracking-wider text-muted-taupe mb-1">
                  Street Address *
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="House number, Street name, Estate / Landmark"
                  className="w-full px-3 py-2.5 bg-bone border border-cocoa/30 text-xs text-ink-black rounded-xs focus:outline-none focus:border-ink-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-xs uppercase tracking-wider text-muted-taupe mb-1">
                    City / Local Area *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Ikeja"
                    className="w-full px-3 py-2.5 bg-bone border border-cocoa/30 text-xs text-ink-black rounded-xs focus:outline-none focus:border-ink-black"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-xs uppercase tracking-wider text-muted-taupe mb-1">
                    State *
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="e.g. Lagos State"
                    className="w-full px-3 py-2.5 bg-bone border border-cocoa/30 text-xs text-ink-black rounded-xs focus:outline-none focus:border-ink-black"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="deliveryNotes" className="block text-xs uppercase tracking-wider text-muted-taupe mb-1">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  id="deliveryNotes"
                  name="deliveryNotes"
                  rows={2}
                  value={formData.deliveryNotes}
                  onChange={handleInputChange}
                  placeholder="Gate code, security desk instructions, or preferred drop-off time."
                  className="w-full px-3 py-2 bg-bone border border-cocoa/30 text-xs text-ink-black rounded-xs focus:outline-none focus:border-ink-black"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 px-8 bg-ink-black text-warm-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-espresso transition-colors rounded-xs focus-dark min-h-[48px] disabled:opacity-70 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting
                    ? 'Preparing Secure Checkout...'
                    : `Proceed to Payment — ₦${totalAmount.toLocaleString()}`}
                </span>
              </button>

              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-muted-taupe mt-3 text-center">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cocoa shrink-0" />
                  Bank-Grade Encryption
                </span>
                <span className="hidden sm:inline">•</span>
                <span>Explicit Payment Confirmation</span>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Permanently Visible Order Summary (Never Collapsed) */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="bg-warm-white border border-cocoa/20 rounded-sm p-6 space-y-6 shadow-xs">
            <div className="flex items-baseline justify-between border-b border-cocoa/15 pb-4">
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-ink-black">
                Order Summary ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
              <span className="text-[11px] text-muted-taupe uppercase tracking-wider">
                Drop 001
              </span>
            </div>

            {/* Line items list with explicit charm/engraving details */}
            <div className="divide-y divide-cocoa/15 max-h-[360px] overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div
                  key={`${item.product.slug}-${item.selectedSize}`}
                  className="py-3 flex gap-3 items-start"
                >
                  <div className="relative w-14 h-14 bg-bone border border-cocoa/20 rounded-xs shrink-0 overflow-hidden">
                    <Image
                      src={item.product.images[0]?.src || '/images/products/packaging-box.svg'}
                      alt={item.product.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-semibold text-ink-black truncate">
                        {item.product.name}
                      </h3>
                      <span className="text-xs font-bold text-ink-black ml-2">
                        ₦{(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-taupe">
                      Size: <span className="font-semibold text-ink-black">{item.selectedSize}</span> · Qty: {item.quantity}
                    </p>

                    {item.withHeartCharm && (
                      <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-cocoa font-medium">
                        <Heart className="w-2.5 h-2.5 fill-oxblood text-oxblood" />
                        <span>
                          Heart charm{item.engravedText ? ` — engraved '${item.engravedText}'` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="pt-4 border-t border-cocoa/15 space-y-2 text-xs">
              <div className="flex justify-between text-muted-taupe">
                <span>Items Subtotal</span>
                <span className="font-semibold text-ink-black">
                  ₦{subtotal.toLocaleString()}
                </span>
              </div>

              {/* Delivery Fee — Prominently Shown Before Payment */}
              <div className="flex justify-between items-baseline text-muted-taupe">
                <div>
                  <span>Delivery ({selectedZone.name})</span>
                  <span className="block text-[10px] text-cocoa">
                    {selectedZone.estimatedDays}
                  </span>
                </div>
                <span className="font-semibold text-ink-black">
                  ₦{deliveryFee.toLocaleString()}
                </span>
              </div>

              <div className="pt-3 border-t border-cocoa/15 flex justify-between items-baseline text-sm">
                <span className="font-bold text-ink-black">Total to Pay</span>
                <span className="text-base font-bold text-ink-black">
                  ₦{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Delivery Promise */}
            <div className="p-3 bg-bone border border-cocoa/20 rounded-xs flex items-start gap-2.5 text-[11px] text-ink-black/80">
              <Truck className="w-4 h-4 text-cocoa shrink-0 mt-0.5" />
              <span>
                Drop 001 dispatch arrives in our signature slim kraft box with protective tissue, thank-you care card, and shopping bag.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
