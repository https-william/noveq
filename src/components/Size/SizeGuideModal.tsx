'use client';

import { useEffect, useRef } from 'react';
import { X, Ruler, Footprints } from 'lucide-react';
import { ProductSize } from '@/types/commerce';
import { WORLDWIDE_WOMEN_SIZES } from '@/config/sizing';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  productSizes?: ProductSize[];
}

export default function SizeGuideModal({
  isOpen,
  onClose,
  productSizes,
}: SizeGuideModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      closeBtnRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Extract map of size availability on current product
  const sizeAvailabilityMap = new Map(
    (productSizes || []).map((s) => [s.size, s.available])
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="NOVEQ Size & Fit Guide"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-ink-black/70 backdrop-blur-xs"
    >
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full sm:max-w-2xl bg-warm-white text-ink-black border-t sm:border border-cocoa/30 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 sm:p-6 border-b border-cocoa/20 bg-bone/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Ruler className="w-5 h-5 text-cocoa" aria-hidden="true" />
            <div>
              <span className="text-[10px] uppercase tracking-widest text-muted-taupe font-bold block">
                Worldwide Women&apos;s Standard
              </span>
              <h2 className="font-editorial text-xl sm:text-2xl font-normal text-ink-black">
                Size &amp; Measurement Guide
              </h2>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close size guide"
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-taupe hover:text-ink-black rounded-full focus-dark"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Fit Notes & Sizing Decision Placeholder */}
          <div className="p-4 bg-bone border border-cocoa/25 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-cocoa font-bold uppercase tracking-wider text-[11px]">
              <Footprints className="w-4 h-4" />
              <span>How NOVEQ Pams Fit</span>
            </div>
            <p className="leading-relaxed text-ink-black/85">
              Every Drop 001 pair is made to order in Lagos across EU 34 to EU 44 (UK 1.5–10.0 / US 4.0–12.0) using soft natural leather that gently relaxes to match your foot width after 2–3 wears.
            </p>
            <div className="p-3.5 bg-warm-white border border-cocoa/20 rounded-lg text-[11px] text-muted-taupe leading-relaxed">
              <span className="font-semibold text-cocoa block uppercase tracking-wider text-[10px] mb-0.5">
                Fit Advisory
              </span>
              Our pams follow standard worldwide sizing. If you typically sit between sizes or have wider feet, we recommend choosing the next size up, or messaging our team on WhatsApp for quick help before ordering.
            </div>
          </div>

          {/* Size Conversion Table (Dynamically Highlights Active Product Sizes) */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.16em] font-bold text-ink-black mb-3">
              International Size Conversion (EU · UK · US · Foot Length)
            </h3>
            <div className="border border-cocoa/20 rounded-xl overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-bone text-ink-black uppercase tracking-wider text-[10px] border-b border-cocoa/20">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">EU</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">UK</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">US Women</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Foot Length</th>
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cocoa/15 bg-warm-white">
                  {WORLDWIDE_WOMEN_SIZES.map((row) => {
                    const hasEntry = sizeAvailabilityMap.has(row.eu);
                    const isAvailable = sizeAvailabilityMap.get(row.eu) === true;
                    return (
                      <tr
                        key={row.eu}
                        className={isAvailable ? 'bg-cocoa/[0.04] font-medium' : ''}
                      >
                        <td className="py-2.5 px-3 font-semibold text-ink-black whitespace-nowrap">
                          {row.eu}
                        </td>
                        <td className="py-2.5 px-3 text-muted-taupe whitespace-nowrap">{row.uk}</td>
                        <td className="py-2.5 px-3 text-muted-taupe whitespace-nowrap">{row.us}</td>
                        <td className="py-2.5 px-3 text-muted-taupe whitespace-nowrap tabular-nums">{row.cm}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {isAvailable ? (
                            <span className="px-2 py-0.5 bg-espresso text-warm-white text-[9px] uppercase tracking-wider rounded-full font-semibold">
                              Made to Order
                            </span>
                          ) : hasEntry ? (
                            <span className="text-[10px] text-muted-taupe">Restocking</span>
                          ) : (
                            <span className="text-[10px] text-muted-taupe/70">Custom Request</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* How to Measure Foot Length */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs uppercase tracking-[0.16em] font-bold text-ink-black">
              How to Measure Your Foot
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-xs text-ink-black/80 leading-relaxed">
              <li>
                Place a sheet of clean paper flat on the floor against a straight wall.
              </li>
              <li>
                Stand barefoot on the paper with your heel resting gently against the wall.
              </li>
              <li>
                Trace the furthest tip of your longest toe with a vertical pen.
              </li>
              <li>
                Measure the distance from the wall edge to the marked line in centimeters and match with the table above.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cocoa/20 bg-bone/50 flex items-center justify-between text-xs">
          <span className="text-muted-taupe text-[11px]">
            Need personal sizing assistance?
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-ink-black text-warm-white text-xs uppercase tracking-wider rounded-full hover:bg-espresso transition-all duration-200 shadow-apple-sm active:scale-[0.98]"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
