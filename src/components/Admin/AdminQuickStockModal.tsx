'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Product } from '@/types/commerce';
import { WORLDWIDE_WOMEN_SIZES } from '@/config/sizing';

interface AdminQuickStockModalProps {
  product: Product;
  isSaving: boolean;
  onChangeProduct: (updated: Product) => void;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
}

export function AdminQuickStockModal({
  product,
  isSaving,
  onChangeProduct,
  onClose,
  onSave,
}: AdminQuickStockModalProps) {
  const existingSizes = product.sizes || [];
  const hasMissingWorldwideSizes = WORLDWIDE_WOMEN_SIZES.some(
    (spec) => !existingSizes.some((s) => s.size === spec.eu)
  );

  const handleAddMissingWorldwideSizes = () => {
    const map = new Map(existingSizes.map((s) => [s.size, s]));
    const fullSizes = WORLDWIDE_WOMEN_SIZES.map((spec) => {
      const existing = map.get(spec.eu);
      return (
        existing || {
          size: spec.eu,
          available: true,
          stockCount: 2,
        }
      );
    });
    const newTotal = fullSizes.reduce((sum, s) => sum + s.stockCount, 0);
    onChangeProduct({
      ...product,
      sizes: fullSizes,
      stock: newTotal,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink-black/55 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-warm-white border border-cocoa/15 max-w-lg w-full rounded-2xl shadow-[0_24px_64px_-16px_rgba(42,27,21,0.22)] overflow-hidden my-8">
        <div className="p-4 sm:p-5 border-b border-cocoa/12 bg-bone/50 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-cocoa block">
              Stock &amp; Pricing
            </span>
            <h3 className="font-editorial text-2xl font-normal text-ink-black truncate">
              {product.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close stock editor"
            className="press-tactile p-1.5 hover:bg-cocoa/10 rounded-full min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4 text-ink-black" />
          </button>
        </div>

        <form onSubmit={onSave} className="p-5 sm:p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-espresso mb-1.5">
                Regular Price (₦)
              </label>
              <input
                type="number"
                min={1000}
                step={500}
                required
                value={product.price}
                onChange={(e) =>
                  onChangeProduct({ ...product, price: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 bg-bone/50 border border-cocoa/18 rounded-xl font-mono font-medium text-ink-black text-sm min-h-[44px] focus:outline-none focus:border-ink-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-espresso mb-1.5">
                Total Pairs Left
              </label>
              <input
                type="number"
                min={0}
                required
                value={product.stock}
                onChange={(e) =>
                  onChangeProduct({ ...product, stock: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 bg-bone/50 border border-cocoa/18 rounded-xl font-mono font-medium text-ink-black text-sm min-h-[44px] focus:outline-none focus:border-ink-black"
              />
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-cocoa/12">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-medium text-espresso">
                Pairs Per Size (EU 34–44)
              </label>
              {hasMissingWorldwideSizes && (
                <button
                  type="button"
                  onClick={handleAddMissingWorldwideSizes}
                  className="text-[11px] font-semibold text-espresso hover:underline cursor-pointer"
                >
                  + Expand to full EU 34–44 range
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[260px] overflow-y-auto pr-1">
              {existingSizes.map((sz, idx) => (
                <div
                  key={sz.size}
                  className="p-2 bg-bone/60 border border-cocoa/20 rounded-xl text-center"
                >
                  <div className="font-semibold text-[11px] text-ink-black">
                    {sz.size}
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={sz.stockCount}
                    onChange={(e) => {
                      const updatedCount = Math.max(
                        0,
                        Number(e.target.value) || 0
                      );
                      const updatedSizes = [...existingSizes];
                      updatedSizes[idx] = {
                        ...sz,
                        stockCount: updatedCount,
                        available: updatedCount > 0,
                      };
                      const newTotal = updatedSizes.reduce(
                        (sum, s) => sum + s.stockCount,
                        0
                      );
                      onChangeProduct({
                        ...product,
                        sizes: updatedSizes,
                        stock: newTotal,
                      });
                    }}
                    className="w-full text-center px-1 py-1 mt-1 bg-warm-white border border-cocoa/30 rounded-lg font-mono font-bold text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-cocoa/12">
            <button
              type="button"
              onClick={onClose}
              className="press-tactile flex-1 py-2.5 bg-warm-white border border-cocoa/18 text-ink-black text-xs font-medium rounded-full hover:bg-bone transition-colors min-h-[42px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="press-tactile flex-1 py-2.5 bg-ink-black text-warm-white text-xs font-medium rounded-full hover:bg-espresso transition-colors disabled:opacity-50 min-h-[42px] cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Save Stock & Price'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
