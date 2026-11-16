'use client';

import React from 'react';
import Image from 'next/image';
import {
  PlusCircle,
  Layers,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  Edit3,
  Trash2,
  Package,
} from 'lucide-react';
import { Product } from '@/types/commerce';
import { getBlackFridayUnitPrice } from '@/config/blackFriday';

interface AdminProductsTabProps {
  products: Product[];
  productsLoading: boolean;
  onOpenAddModal: () => void;
  onToggleVisibility: (slug: string, currentHidden?: boolean) => void;
  onToggleRestocking: (slug: string, currentRestocking?: boolean) => void;
  onOpenQuickStock: (product: Product) => void;
  onOpenEditModal: (product: Product) => void;
  onRequestDeleteProduct: (product: Product) => void;
}

export function AdminProductsTab({
  products,
  productsLoading,
  onOpenAddModal,
  onToggleVisibility,
  onToggleRestocking,
  onOpenQuickStock,
  onOpenEditModal,
  onRequestDeleteProduct,
}: AdminProductsTabProps) {
  return (
    <div className="bg-warm-white border border-cocoa/20 rounded-2xl shadow-apple-sm space-y-5 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cocoa/15">
        <div>
          <h2 className="font-editorial text-2xl font-normal text-ink-black">
            Catalog, Sizing &amp; Availability
          </h2>
          <p className="text-xs text-muted-taupe mt-0.5">
            Toggle styles between Open and Restocking Soon, edit EU 34–44 stock levels, or add new pairs.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-ink-black hover:bg-espresso text-warm-white text-xs uppercase tracking-[0.18em] font-semibold rounded-full transition-colors focus-dark shadow-xs min-h-[44px] cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Style</span>
        </button>
      </div>

      {productsLoading ? (
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          aria-busy="true"
          aria-label="Loading products"
        >
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="border border-cocoa/15 rounded-2xl p-5 bg-bone/30 animate-pulse space-y-4"
            >
              <div className="flex gap-4 items-start">
                <div className="w-20 h-20 bg-cocoa/15 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-2/3 bg-cocoa/20 rounded" />
                  <div className="h-3 w-1/2 bg-cocoa/10 rounded" />
                </div>
              </div>
              <div className="h-10 w-full bg-cocoa/10 rounded-xl" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center text-xs text-muted-taupe space-y-2 border border-dashed border-cocoa/20 rounded-2xl">
          <Layers className="w-8 h-8 text-cocoa/40 mx-auto" />
          <p className="font-semibold text-ink-black text-sm">
            No footwear styles in catalog
          </p>
          <p>Click &ldquo;Add Style&rdquo; above to add your first pair.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {products.map((product) => {
            const isHidden =
              product.hidden || product.publish_status === 'draft';
            const isRestocking =
              Boolean(product.restocking) ||
              product.stock <= 0 ||
              product.sizes.every((s) => !s.available);
            const nov27Price = getBlackFridayUnitPrice(product.price);

            return (
              <div
                key={product.slug}
                className={`border rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-colors ${
                  isHidden
                    ? 'border-cocoa/20 bg-bone/40 opacity-85'
                    : 'border-cocoa/25 bg-warm-white shadow-xs'
                }`}
              >
                {/* Top: Image + Title + Live Badges */}
                <div className="flex gap-4 items-start">
                  <div className="relative w-20 h-24 bg-bone border border-cocoa/15 rounded-xl shrink-0 overflow-hidden">
                    <Image
                      src={
                        product.images[0]?.src ||
                        '/images/products/the-weave-black.jpg'
                      }
                      alt={product.name}
                      fill
                      unoptimized={Boolean(
                        product.images[0]?.src?.startsWith('data:') ||
                          product.images[0]?.src?.startsWith('http')
                      )}
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-editorial text-xl font-normal text-ink-black truncate">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-semibold tracking-wider border ${
                            isRestocking
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          }`}
                        >
                          {isRestocking ? 'Restocking Soon' : 'Open for Orders'}
                        </span>
                        {isHidden && (
                          <span className="text-[9px] uppercase px-2 py-0.5 rounded-full font-semibold tracking-wider bg-gray-200 text-gray-700 border border-gray-300">
                            Hidden
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-muted-taupe font-mono truncate">
                      /{product.slug} · {product.colour}
                    </div>

                    <div className="flex flex-wrap items-baseline gap-2.5 pt-0.5">
                      <span className="text-base font-bold font-mono text-ink-black tabular-nums">
                        ₦{product.price.toLocaleString()}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#111111] text-[#b89b72] font-mono tabular-nums">
                        Nov 27 (25% off): ₦{nov27Price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle: Stock Summary & EU 34-44 Sizes */}
                <div className="p-3.5 bg-bone/60 border border-cocoa/15 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-cocoa uppercase tracking-wider">
                      Stock Across Worldwide Sizes
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        product.stock <= 2 ? 'text-oxblood' : 'text-ink-black'
                      }`}
                    >
                      {product.stock} pairs total
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(product.sizes || []).map((sz) => (
                      <span
                        key={sz.size}
                        className={`px-2 py-0.5 text-[10px] font-mono rounded-md border ${
                          sz.stockCount > 0 && sz.available
                            ? 'bg-warm-white border-cocoa/20 text-ink-black'
                            : 'bg-bone/50 border-cocoa/15 text-muted-taupe/60 line-through'
                        }`}
                      >
                        {sz.size.replace('EU ', '')}: {sz.stockCount}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Controls */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-cocoa/15">
                  <button
                    type="button"
                    onClick={() =>
                      onToggleRestocking(product.slug, Boolean(product.restocking))
                    }
                    className={`flex-1 min-w-[140px] py-2 px-3 text-xs font-semibold rounded-full border transition-colors flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer ${
                      isRestocking
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-amber-50/70 text-amber-950 border-amber-300/70 hover:bg-amber-100'
                    }`}
                  >
                    {isRestocking ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Mark Open</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Set Restocking</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenQuickStock(product)}
                    className="py-2 px-3.5 text-xs font-semibold rounded-full border border-cocoa/30 bg-warm-white text-ink-black hover:bg-bone transition-colors flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5 text-cocoa" />
                    <span>Stock &amp; Sizes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onToggleVisibility(product.slug, product.hidden)
                    }
                    className="py-2 px-3 text-xs font-medium rounded-full border border-cocoa/25 bg-warm-white text-cocoa hover:text-ink-black hover:bg-bone transition-colors flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer"
                    title={isHidden ? 'Show on storefront' : 'Hide from storefront'}
                  >
                    {isHidden ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Show</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenEditModal(product)}
                    className="py-2 px-3.5 text-xs font-medium rounded-full border border-cocoa/25 bg-warm-white text-ink-black hover:bg-bone transition-colors flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cocoa" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRequestDeleteProduct(product)}
                    aria-label={`Delete ${product.name}`}
                    className="p-2 rounded-full border border-oxblood/25 text-oxblood hover:bg-oxblood/10 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
