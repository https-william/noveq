'use client';

import { useEffect, useRef } from 'react';
import { X, Ruler, Footprints } from 'lucide-react';
import { ProductSize } from '@/types/commerce';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  productSizes?: ProductSize[];
}

const GLOBAL_SIZE_CHART = [
  { eu: 'EU 36', cm: '23.0 cm', uk: 'UK 3.5', us: 'US 5.5' },
  { eu: 'EU 37', cm: '23.7 cm', uk: 'UK 4.0', us: 'US 6.0' },
  { eu: 'EU 38', cm: '24.4 cm', uk: 'UK 5.0', us: 'US 7.0' },
  { eu: 'EU 39', cm: '25.0 cm', uk: 'UK 6.0', us: 'US 8.0' },
  { eu: 'EU 40', cm: '25.7 cm', uk: 'UK 6.5', us: 'US 8.5' },
  { eu: 'EU 41', cm: '26.4 cm', uk: 'UK 7.5', us: 'US 9.5' },
  { eu: 'EU 42', cm: '27.0 cm', uk: 'UK 8.0', us: 'US 10.0' },
];

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

  // Extract set of sizes present in current product
  const activeProductSizes = new Set(productSizes?.map((s) => s.size) || []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="NOVEQ Size & Fit Guide"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/70 backdrop-blur-xs"
    >
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl bg-warm-white text-ink-black border border-cocoa/30 rounded-sm shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-cocoa/20 bg-bone/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-cocoa" aria-hidden="true" />
            <div>
              <span className="text-[10px] uppercase tracking-widest text-muted-taupe font-bold block">
                NOVEQ Fit Standard
              </span>
              <h2 className="text-lg font-bold text-ink-black">
                Size & Measurement Guide
              </h2>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close size guide"
            className="p-2 text-muted-taupe hover:text-ink-black rounded-sm focus-dark"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Fit Notes & Sizing Decision Placeholder */}
          <div className="p-4 bg-bone border border-cocoa/30 rounded-xs space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-cocoa font-bold uppercase tracking-wider text-[11px]">
              <Footprints className="w-4 h-4" />
              <span>How NOVEQ Pams Run</span>
            </div>
            <p className="leading-relaxed text-ink-black/85">
              Drop 001 footwear is crafted with full-grain leather that naturally molds to foot width after 2–3 wears.
            </p>
            <div className="p-3 bg-warm-white border border-cocoa/20 rounded-xs text-[11px] text-muted-taupe leading-relaxed">
              <span className="font-semibold text-cocoa block uppercase tracking-wider text-[10px] mb-0.5">
                Fit Advisory
              </span>
              Our footwear runs true to standard European sizing. If you typically wear a half size or have wider feet, we suggest taking the next size up, or messaging our team on WhatsApp for quick advice before ordering.
            </div>
          </div>

          {/* Size Conversion Table (Dynamically Highlights Active Product Sizes) */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.16em] font-bold text-ink-black mb-3">
              Size Conversion Matrix
            </h3>
            <div className="border border-cocoa/20 rounded-xs overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[420px]">
                <thead className="bg-bone text-ink-black uppercase tracking-wider text-[10px] border-b border-cocoa/20">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">EU Size</th>
                    <th className="py-2.5 px-3 font-semibold">Foot Length</th>
                    <th className="py-2.5 px-3 font-semibold">UK Equivalent</th>
                    <th className="py-2.5 px-3 font-semibold">US Equivalent</th>
                    <th className="py-2.5 px-3 font-semibold">Drop 001</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cocoa/15 bg-warm-white">
                  {GLOBAL_SIZE_CHART.map((row) => {
                    const isInCurrentProduct = activeProductSizes.has(row.eu);
                    return (
                      <tr
                        key={row.eu}
                        className={isInCurrentProduct ? 'bg-cocoa/5 font-medium' : ''}
                      >
                        <td className="py-2.5 px-3 font-semibold text-ink-black">
                          {row.eu}
                        </td>
                        <td className="py-2.5 px-3 text-muted-taupe">{row.cm}</td>
                        <td className="py-2.5 px-3 text-muted-taupe">{row.uk}</td>
                        <td className="py-2.5 px-3 text-muted-taupe">{row.us}</td>
                        <td className="py-2.5 px-3">
                          {isInCurrentProduct ? (
                            <span className="px-2 py-0.5 bg-espresso text-warm-white text-[9px] uppercase tracking-wider rounded-xs font-semibold">
                              Available in Drop
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-taupe/60">—</span>
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
            className="px-5 py-2 bg-ink-black text-warm-white text-xs uppercase tracking-wider rounded-xs hover:bg-espresso transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
