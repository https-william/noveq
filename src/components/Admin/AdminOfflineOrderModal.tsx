'use client';

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Product } from '@/types/commerce';
import { WORLDWIDE_WOMEN_SIZES, formatCompactInternationalSize } from '@/config/sizing';
import { BLACK_FRIDAY_DISCOUNT_RATE } from '@/config/blackFriday';
import { OfflineOrderForm } from './adminUtils';

interface AdminOfflineOrderModalProps {
  products: Product[];
  form: OfflineOrderForm;
  confirmStep: boolean;
  isSubmitting: boolean;
  onChangeForm: (form: OfflineOrderForm) => void;
  onSetConfirmStep: (step: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function AdminOfflineOrderModal({
  products,
  form,
  confirmStep,
  isSubmitting,
  onChangeForm,
  onSetConfirmStep,
  onSubmit,
  onClose,
}: AdminOfflineOrderModalProps) {
  const selectedProduct = products.find(
    (p) => p.name.toLowerCase() === form.productName.toLowerCase()
  );

  const getProductUnitPrice = (name: string): number => {
    const matched = products.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    if (matched && matched.price > 0) return matched.price;
    if (name.toLowerCase().includes('weave')) return 20000;
    return 25000;
  };

  const calculateTotal = (
    unitPrice: number,
    qty: number,
    applyBf: boolean
  ): number => {
    const raw = unitPrice * qty;
    return applyBf ? Math.round(raw * (1 - BLACK_FRIDAY_DISCOUNT_RATE)) : raw;
  };

  const colourOptions =
    selectedProduct?.colours && selectedProduct.colours.length > 0
      ? selectedProduct.colours.map((c) => c.name)
      : [
          'Black',
          'Warm Cognac',
          'Burgundy',
          'Off White',
          'Army Green',
          'Dark Brown',
        ];

  return (
    <div className="fixed inset-0 z-50 bg-ink-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-warm-white border border-cocoa/30 max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="p-4 sm:p-5 border-b border-cocoa/15 bg-bone/70 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-cocoa block">
              WhatsApp / Direct Sale
            </span>
            <h3 className="font-editorial text-xl font-normal text-ink-black">
              Record Offline Sale
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close offline order modal"
            className="p-1 hover:bg-cocoa/10 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5 text-ink-black" />
          </button>
        </div>

        {confirmStep ? (
          <div className="p-6 space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-900">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-700" />
              <div className="text-xs space-y-1">
                <p className="font-semibold">Confirm this offline order</p>
                <p>
                  This saves the order in NOVEQ Admin, logs it to Google Sheets, and alerts the studio channel.
                </p>
              </div>
            </div>

            <div className="p-4 bg-bone/60 border border-cocoa/20 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-taupe">Buyer:</span>
                <span className="font-semibold text-ink-black">
                  {form.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-taupe">Phone:</span>
                <span className="font-mono">{form.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-taupe">Pair:</span>
                <span className="font-semibold text-ink-black">
                  {form.productName} ({form.colour}, {form.size}) x{form.quantity}
                </span>
              </div>
              {form.applyBlackFridayDiscount && (
                <div className="flex justify-between text-cocoa font-medium">
                  <span>Discount:</span>
                  <span>24-Hour Edit · 25% Off Applied</span>
                </div>
              )}
              <div className="flex justify-between border-t border-cocoa/15 pt-2 text-sm font-bold">
                <span>Total Amount:</span>
                <span className="font-mono">₦{form.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-cocoa">
                <span>Channel:</span>
                <span>{form.paymentMethod}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => onSetConfirmStep(false)}
                className="flex-1 py-3 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-bone transition-colors min-h-[44px] cursor-pointer"
              >
                Back to Edit
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onSubmit}
                className="flex-1 py-3 bg-ink-black text-warm-white text-xs uppercase tracking-wider font-bold rounded-full hover:bg-espresso transition-colors disabled:opacity-50 min-h-[44px] cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-4 text-xs max-h-[82vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                  Buyer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tunde Williams"
                  value={form.customerName}
                  onChange={(e) =>
                    onChangeForm({ ...form, customerName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl text-ink-black font-medium min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +234 803 000 0000"
                  value={form.phone}
                  onChange={(e) =>
                    onChangeForm({ ...form, phone: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl text-ink-black font-medium font-mono min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="buyer@example.com"
                  value={form.email}
                  onChange={(e) =>
                    onChangeForm({ ...form, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl text-ink-black font-medium min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={form.state}
                  onChange={(e) =>
                    onChangeForm({ ...form, state: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl text-ink-black font-medium min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                  City / Area *
                </label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) =>
                    onChangeForm({ ...form, city: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl text-ink-black font-medium min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Street, estate, or landmark"
                  value={form.address}
                  onChange={(e) =>
                    onChangeForm({ ...form, address: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl text-ink-black font-medium min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-cocoa/15">
              <div>
                <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                  Style
                </label>
                <select
                  value={form.productName}
                  onChange={(e) => {
                    const newName = e.target.value;
                    const unitPrice = getProductUnitPrice(newName);
                    const matched = products.find((p) => p.name === newName);
                    onChangeForm({
                      ...form,
                      productName: newName,
                      colour: matched?.colours?.[0]?.name || matched?.colour || form.colour,
                      total: calculateTotal(
                        unitPrice,
                        form.quantity,
                        form.applyBlackFridayDiscount
                      ),
                    });
                  }}
                  className="w-full px-2.5 py-2 bg-bone/60 border border-cocoa/30 rounded-xl text-ink-black font-medium min-h-[44px]"
                >
                  {products.map((p) => (
                    <option key={p.slug} value={p.name}>
                      {p.name} (₦{p.price.toLocaleString()})
                      {p.restocking ? ' · Restocking' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                  Colour
                </label>
                <select
                  value={form.colour}
                  onChange={(e) =>
                    onChangeForm({ ...form, colour: e.target.value })
                  }
                  className="w-full px-2.5 py-2 bg-bone/60 border border-cocoa/30 rounded-xl text-ink-black font-medium min-h-[44px]"
                >
                  {colourOptions.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                  Worldwide Size
                </label>
                <select
                  value={form.size}
                  onChange={(e) =>
                    onChangeForm({ ...form, size: e.target.value })
                  }
                  className="w-full px-2.5 py-2 bg-bone/60 border border-cocoa/30 rounded-xl text-ink-black font-medium min-h-[44px]"
                >
                  {WORLDWIDE_WOMEN_SIZES.map((spec) => (
                    <option key={spec.eu} value={spec.eu}>
                      {formatCompactInternationalSize(spec.eu)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.quantity}
                  onChange={(e) => {
                    const qty = Math.max(1, Number(e.target.value) || 1);
                    const unitPrice = getProductUnitPrice(form.productName);
                    onChangeForm({
                      ...form,
                      quantity: qty,
                      total: calculateTotal(
                        unitPrice,
                        qty,
                        form.applyBlackFridayDiscount
                      ),
                    });
                  }}
                  className="w-full px-3 py-2 bg-bone/60 border border-cocoa/30 rounded-xl text-ink-black font-medium font-mono min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                  Total Paid (₦)
                </label>
                <input
                  type="number"
                  value={form.total}
                  onChange={(e) =>
                    onChangeForm({ ...form, total: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-bone/60 border border-cocoa/30 rounded-xl text-ink-black font-bold font-mono min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                  Channel
                </label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) =>
                    onChangeForm({ ...form, paymentMethod: e.target.value })
                  }
                  className="w-full px-2.5 py-2 bg-bone/60 border border-cocoa/30 rounded-xl text-ink-black font-medium min-h-[44px]"
                >
                  <option value="Direct Bank Transfer">Bank Transfer</option>
                  <option value="WhatsApp Order">WhatsApp Order</option>
                  <option value="Instagram DM">Instagram DM</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Pop-up Showroom">Studio Visit</option>
                </select>
              </div>
            </div>

            {/* Nov 27 Discount Toggle */}
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#111111] text-[#f4f3ef] border border-[#b89b72]/35 cursor-pointer">
              <input
                type="checkbox"
                checked={form.applyBlackFridayDiscount}
                onChange={(e) => {
                  const checked = e.target.checked;
                  const unitPrice = getProductUnitPrice(form.productName);
                  onChangeForm({
                    ...form,
                    applyBlackFridayDiscount: checked,
                    total: calculateTotal(unitPrice, form.quantity, checked),
                  });
                }}
                className="w-4 h-4 accent-[#b89b72]"
              />
              <span className="text-xs">
                Apply <strong className="text-[#b89b72]">Nov 27 · 25% off</strong> pair pricing
              </span>
            </label>

            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                Courier Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Confirmed transfer, deliver before 4pm"
                value={form.deliveryNotes}
                onChange={(e) =>
                  onChangeForm({ ...form, deliveryNotes: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl text-ink-black font-medium min-h-[44px]"
              />
            </div>

            <div className="flex gap-3 pt-3 border-t border-cocoa/15">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-bone transition-colors min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-ink-black text-warm-white text-xs uppercase tracking-wider font-bold rounded-full hover:bg-espresso transition-colors shadow-xs min-h-[44px] cursor-pointer"
              >
                Review &amp; Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
