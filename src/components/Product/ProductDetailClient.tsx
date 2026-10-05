'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  ChevronDown,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Sparkles,
  Ruler,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import { Product } from '@/types/commerce';
import { useCart } from '@/context/CartContext';
import SizeGuideModal from '@/components/Size/SizeGuideModal';
import { CustomerProofSection } from '@/components/SocialProof/CustomerProofSection';
import { trackEvent } from '@/lib/analytics';
import { SITE_SETTINGS } from '@/config/siteSettings';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart } = useCart();

  // Gallery state & touch swipe
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Colour selection state
  const initialColour = product.colours?.[0]?.name || product.colour;
  const [selectedColour, setSelectedColour] = useState<string>(initialColour);

  // Size selection & validation state
  const initialSize = product.sizes.find((s) => s.available)?.size || '';
  const [selectedSize, setSelectedSize] = useState<string>(initialSize);
  const [sizeError, setSizeError] = useState<string | null>(null);

  // Charm & personalisation state
  const [charmActive, setCharmActive] = useState(
    product.charm_option.enabledByDefault || false
  );
  const [engravedName, setEngravedName] = useState('');

  // Add to bag button states: 'idle' | 'loading' | 'success'
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success'>('idle');

  // Size guide modal state
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Instrument view_item event (fires once per product mount)
  useEffect(() => {
    trackEvent('view_item', {
      item_id: product.slug,
      item_name: `NOVEQ ${product.name} Women's Leather Pam`,
      price: product.price,
      currency: product.currency,
      item_category: product.collection,
    });
  }, [product.slug, product.name, product.price, product.currency, product.collection]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        // Swipe left -> next image
        setActiveImageIndex((prev) => (prev + 1) % product.images.length);
      } else {
        // Swipe right -> prev image
        setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
      }
    }
    setTouchStartX(null);
  };

  const handleSelectColour = (colourName: string, imageSrc?: string) => {
    setSelectedColour(colourName);
    if (imageSrc) {
      const matchIndex = product.images.findIndex((img) => img.src === imageSrc);
      if (matchIndex > -1) {
        setActiveImageIndex(matchIndex);
      }
    }
    trackEvent('select_colour', {
      item_id: product.slug,
      item_name: product.name,
      colour: colourName,
    });
  };

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    setSizeError(null);
    trackEvent('select_size', {
      item_id: product.slug,
      item_name: `NOVEQ ${product.name} Women's Leather Pam`,
      size,
      colour: selectedColour,
    });
  };

  // Accordion open states (1: Details, 2: Fit & sizing, 3: Care, 4: Shipping & returns)
  const [openAccordion, setOpenAccordion] = useState<number | null>(1);

  const toggleAccordion = (index: number) => {
    setOpenAccordion((prev) => (prev === index ? null : index));
  };

  const selectedSizeObj = product.sizes.find((s) => s.size === selectedSize);
  const isSelectedSizeAvailable = selectedSizeObj?.available ?? false;

  const handleAddToBag = () => {
    if (buttonState !== 'idle') return;

    if (!selectedSize) {
      setSizeError('Please select a shoe size to add to your bag.');
      const el = document.getElementById('size-selector-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!isSelectedSizeAvailable) {
      setSizeError('Selected size is sold out. Please choose an available size.');
      const el = document.getElementById('size-selector-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSizeError(null);
    setButtonState('loading');
    setTimeout(() => {
      addToCart(product, selectedSize, 1, {
        withHeartCharm: charmActive,
        engravedText: charmActive && engravedName ? engravedName.trim() : undefined,
        selectedColour,
      });

      // Instrument add_to_cart event (safe parameters, no PII)
      trackEvent('add_to_cart', {
        item_id: product.slug,
        item_name: `NOVEQ ${product.name} Women's Leather Pam`,
        price: product.price,
        currency: product.currency,
        quantity: 1,
        size: selectedSize,
        item_variant: `${selectedSize} - ${selectedColour}`,
      });

      setButtonState('success');
      setTimeout(() => {
        setButtonState('idle');
      }, 1500);
    }, 300);
  };


  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: product.currency,
    maximumFractionDigits: 0,
  }).format(product.price);

  const formattedComparePrice = product.compare_at_price
    ? new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: product.currency,
        maximumFractionDigits: 0,
      }).format(product.compare_at_price)
    : null;

  const activeImage = product.images[activeImageIndex] || product.images[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 pb-28 sm:pb-16">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="pb-6 text-xs uppercase tracking-[0.16em] text-muted-taupe">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-ink-black transition-colors focus-dark">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/shop" className="hover:text-ink-black transition-colors focus-dark">
              Shop Drop 001
            </Link>
          </li>
          <li>/</li>
          <li className="text-ink-black font-semibold truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* ── 1. GALLERY SECTION (5-8 images, desktop thumbnail rail, mobile scrollable) ── */}
        <div className="lg:col-span-7 flex flex-col-reverse lg:flex-row gap-4">
          {/* Desktop Thumbnail Rail / Selector */}
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 shrink-0">
            {product.images.map((img, idx) => (
              <button
                key={`${img.src}-${idx}`}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                aria-label={`View photo ${idx + 1}: ${img.viewType}`}
                aria-current={activeImageIndex === idx}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 bg-bone border rounded-xs shrink-0 overflow-hidden transition-all duration-150 focus-dark ${
                  activeImageIndex === idx
                    ? 'border-ink-black ring-1 ring-ink-black'
                    : 'border-cocoa/30 hover:border-cocoa/70 opacity-80 hover:opacity-100'
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="80px"
                  className={img.src.endsWith('.svg') ? 'object-contain p-1' : 'object-cover'}
                />
              </button>
            ))}
          </div>

          {/* Main Selected Image Stage */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative aspect-square sm:aspect-[4/3] lg:aspect-square w-full bg-espresso/20 border border-cocoa/20 rounded-sm overflow-hidden flex items-center justify-center select-none shadow-md"
          >
            <Image
              src={activeImage.src}
              alt={activeImage.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className={`transition-all duration-300 ${
                activeImage.src.endsWith('.svg') ? 'object-contain p-6 sm:p-10' : 'object-cover'
              }`}
            />

            {/* View Type Indicator Tag */}
            <div className="absolute top-4 left-4 px-2.5 py-1 bg-warm-white/90 border border-cocoa/30 text-[10px] uppercase tracking-widest text-cocoa font-medium rounded-xs pointer-events-none">
              View // {activeImage.viewType}
            </div>

            {/* Mobile swipe dots */}
            <div className="lg:hidden absolute bottom-2 inset-x-0 flex justify-center items-center gap-1 z-10">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`Go to slide ${idx + 1} of ${product.images.length}`}
                  aria-current={activeImageIndex === idx}
                  className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center focus-dark"
                >
                  <span
                    className={`w-2 h-2 rounded-full transition-all duration-150 ${
                      activeImageIndex === idx
                        ? 'bg-ink-black ring-2 ring-warm-white scale-125'
                        : 'bg-cocoa/40'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 2. ABOVE THE FOLD DETAILS (Zero scrolling required on desktop) ── */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header & Value Statement */}
          <div className="space-y-2 border-b border-cocoa/20 pb-5">
            <div className="flex items-center justify-between text-xs tracking-widest uppercase text-cocoa font-medium">
              <span>{product.collection}</span>
              <span className="font-mono text-muted-taupe">Drop 001 // Limited</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink-black">
              NOVEQ {product.name}
            </h1>

            {/* Price (Never hidden or hover-gated) */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl font-bold text-ink-black font-mono tabular-nums">
                {formattedPrice}
              </span>
              {formattedComparePrice && (
                <span className="text-base text-muted-taupe line-through font-mono tabular-nums">
                  {formattedComparePrice}
                </span>
              )}
              <span className="text-xs uppercase tracking-wider text-muted-taupe">
                Launch Price
              </span>
            </div>

            {/* Concise Value Statement */}
            <p className="text-xs sm:text-sm text-ink-black/80 font-normal leading-relaxed pt-2">
              {product.description}
            </p>
          </div>

          {/* Interactive Colour Selector */}
          <div id="colour-selector-section" className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase tracking-[0.16em] text-muted-taupe font-medium">
                Select Colour
              </span>
              <span className="font-semibold text-ink-black">{selectedColour}</span>
            </div>

            {/* Colour Swatch Options */}
            <div className="flex flex-wrap items-center gap-2.5" role="radiogroup" aria-label="Available shoe colours">
              {(product.colours && product.colours.length > 0
                ? product.colours
                : [{ name: product.colour, hex: product.colourHex || '#141414', imageSrc: product.images[0]?.src }]
              ).map((c) => {
                const isSelected = selectedColour === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectColour(c.name, c.imageSrc)}
                    className={`group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xs border text-xs font-medium transition-all duration-150 min-h-[44px] focus-dark ${
                      isSelected
                        ? 'border-ink-black bg-warm-white text-ink-black ring-1 ring-ink-black shadow-xs font-semibold'
                        : 'border-cocoa/30 bg-bone/40 text-ink-black/80 hover:border-cocoa/70 hover:bg-warm-white'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border border-cocoa/40 shadow-xs shrink-0 transition-transform ${
                        isSelected ? 'scale-110 ring-1 ring-ink-black ring-offset-1' : 'group-hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      aria-hidden="true"
                    />
                    <span>{c.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cocoa ml-0.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-taupe">
              Handcrafted in small batches with genuine Nigerian full-grain leather.
            </p>
          </div>

          {/* Size Selector — MUST be explicit tap/click buttons showing states */}
          <div id="size-selector-section" className="space-y-3 scroll-mt-28">
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase tracking-[0.16em] text-muted-taupe font-medium">
                Select Size
              </span>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-[11px] text-cocoa hover:text-ink-black font-semibold underline underline-offset-4 inline-flex items-center gap-1 focus-dark"
              >
                <Ruler className="w-3 h-3" />
                <span>Size Guide</span>
              </button>
            </div>

            {/* Inline persistent error notification (Never clears user state, announced via role="alert") */}
            {sizeError && (
              <div
                role="alert"
                aria-live="polite"
                className="p-3 bg-oxblood/10 border border-oxblood/30 text-oxblood text-xs rounded-xs flex items-center gap-2 animate-in fade-in duration-150"
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{sizeError}</span>
              </div>
            )}

            <div className="grid grid-cols-5 gap-2" role="group" aria-label="Available shoe sizes">
              {product.sizes.map((sz) => {
                const isSelected = selectedSize === sz.size;
                return (
                  <button
                    key={sz.size}
                    type="button"
                    disabled={!sz.available}
                    onClick={() => handleSelectSize(sz.size)}
                    aria-pressed={isSelected}
                    aria-label={`${sz.size}${sz.available ? '' : ' — Out of stock'}`}
                    className={`py-3 px-2 text-xs uppercase tracking-wider font-semibold rounded-xs border transition-all duration-150 min-h-[44px] flex flex-col items-center justify-center focus-dark ${
                      !sz.available
                        ? 'bg-bone/40 text-muted-taupe/40 border-cocoa/15 cursor-not-allowed line-through'
                        : isSelected
                        ? 'bg-ink-black text-warm-white border-ink-black shadow-sm ring-1 ring-ink-black'
                        : 'bg-warm-white text-ink-black border-cocoa/30 hover:border-ink-black'
                    }`}
                  >
                    <span>{sz.size}</span>
                    {!sz.available && (
                      <span className="text-[9px] no-underline font-normal">Sold out</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real Stock Signal */}
          <div className="flex items-center gap-2 text-xs text-muted-taupe">
            <span className="w-2 h-2 rounded-full bg-cocoa animate-pulse" />
            <span>
              Initial release: <span className="font-semibold text-ink-black">{product.stock} pairs</span> crafted for Drop 001.
            </span>
          </div>

          {/* ── 3. CHARM / PERSONALISATION (Only on products that support it) ── */}
          {product.charm_option.supported && (
            <div className="p-4 bg-bone/70 border border-cocoa/25 rounded-xs space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="charm-active-checkbox" className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    id="charm-active-checkbox"
                    type="checkbox"
                    checked={charmActive}
                    onChange={(e) => setCharmActive(e.target.checked)}
                    className="w-4 h-4 accent-espresso rounded-xs"
                  />
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-black">
                    <Heart className="w-3.5 h-3.5 fill-oxblood text-oxblood" />
                    <span>Heart charm (+ Personalisation)</span>
                  </div>
                </label>
                <span className="text-[10px] uppercase tracking-wider text-cocoa font-medium">
                  Drop 001 Custom
                </span>
              </div>

              {charmActive && product.charm_option.supportsEngraving && (
                <div className="pt-2 border-t border-cocoa/15 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-muted-taupe">
                    <label htmlFor="engraved-name-input">Add a name / initials:</label>
                    <span id="charm-char-count">
                      {engravedName.length}/{product.charm_option.maxEngravingLength || 10}
                    </span>
                  </div>
                  <input
                    id="engraved-name-input"
                    type="text"
                    aria-describedby="charm-char-count"
                    maxLength={product.charm_option.maxEngravingLength || 10}
                    value={engravedName}
                    onChange={(e) => setEngravedName(e.target.value)}
                    placeholder="e.g. AMINAT"
                    className="w-full px-3 py-2 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-widest focus:outline-none focus:border-ink-black rounded-xs"
                  />
                </div>
              )}
            </div>
          )}

          {/* Add to Bag Button (Loading / Success / Out-of-Stock / Disabled States) */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleAddToBag}
              disabled={!selectedSize || !isSelectedSizeAvailable || buttonState !== 'idle'}
              aria-label={
                !isSelectedSizeAvailable
                  ? 'Size currently unavailable'
                  : `Add ${product.name} to bag — ${formattedPrice}`
              }
              className={`w-full py-4 px-8 text-xs uppercase tracking-[0.2em] font-semibold rounded-xs transition-all duration-200 min-h-[48px] flex items-center justify-center gap-2 focus-dark ${
                !isSelectedSizeAvailable
                  ? 'bg-bone text-muted-taupe border border-cocoa/20 cursor-not-allowed'
                  : buttonState === 'success'
                  ? 'bg-cocoa text-warm-white border border-cocoa'
                  : 'bg-ink-black text-warm-white hover:bg-espresso border border-ink-black'
              }`}
            >
              {buttonState === 'loading' && (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-warm-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding to Bag...</span>
                </span>
              )}
              {buttonState === 'success' && (
                <span className="inline-flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Added to Bag</span>
                </span>
              )}
              {buttonState === 'idle' && (
                <span>
                  {!selectedSize
                    ? 'Select a Size'
                    : !isSelectedSizeAvailable
                    ? 'Size Unavailable'
                    : `Add to Bag — ${formattedPrice}`}
                </span>
              )}
            </button>

            {/* Delivery Note (One Line) */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-taupe">
              <Truck className="w-3.5 h-3.5 text-cocoa" aria-hidden="true" />
              <span>{product.shipping_notes}</span>
            </div>
          </div>

          {/* ── 4. CRAFT & MATERIAL ASSURANCE ──
              Highlighting genuine leather integrity, comfort balance, and pair-by-pair inspection. */}
          <div className="p-4 bg-warm-white border border-cocoa/25 rounded-xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cocoa shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs leading-relaxed text-ink-black/85">
              <span className="font-semibold block uppercase tracking-wider text-[10px] text-cocoa mb-0.5">
                Material & Atelier Integrity
              </span>
              Handcrafted from full-grain Nigerian leather with tempered arch support. Individually inspected pair-by-pair in our Lagos studio before dispatch.
            </div>
          </div>

          {/* ── 5. ACCORDION (Exact Order: 1. Details, 2. Fit & sizing, 3. Care, 4. Shipping & returns) ── */}
          <div className="border-t border-cocoa/20 pt-4 divide-y divide-cocoa/15">
            {/* 1. Details */}
            <div className="py-3">
              <button
                type="button"
                onClick={() => toggleAccordion(1)}
                aria-expanded={openAccordion === 1}
                className="w-full flex items-center justify-between text-xs uppercase tracking-[0.16em] font-semibold text-ink-black py-2 focus-dark text-left"
              >
                <span>1. Details</span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-taupe transition-transform duration-200 ${
                    openAccordion === 1 ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openAccordion === 1 && (
                <div className="pt-2 pb-3 text-xs leading-relaxed text-ink-black/80 space-y-2">
                  <p><strong>What it is:</strong> {product.description}</p>
                  <p><strong>What it is made from:</strong> {product.material}</p>
                  {product.dimensions_weight && (
                    <p><strong>Specifications:</strong> {product.dimensions_weight}</p>
                  )}
                  <p><strong>Design Note:</strong> {product.design_note}</p>
                </div>
              )}
            </div>

            {/* 2. Fit & sizing */}
            <div className="py-3">
              <button
                type="button"
                onClick={() => toggleAccordion(2)}
                aria-expanded={openAccordion === 2}
                className="w-full flex items-center justify-between text-xs uppercase tracking-[0.16em] font-semibold text-ink-black py-2 focus-dark text-left"
              >
                <span>2. Fit & sizing</span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-taupe transition-transform duration-200 ${
                    openAccordion === 2 ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openAccordion === 2 && (
                <div className="pt-2 pb-3 text-xs leading-relaxed text-ink-black/80 space-y-3">
                  <p><strong>How it fits:</strong> {product.fit_notes}</p>
                  <p>
                    Built with a contoured instep that allows natural toe splay. If you require half-sizes or have broad arches, we advise reaching our{' '}
                    <a
                      href={`https://wa.me/${SITE_SETTINGS.supportContact.phone}?text=${encodeURIComponent(`Hello NOVEQ, I have a sizing question about ${product.name} (${selectedColour}).`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('click_whatsapp', { placement: 'pdp_sizing_support' })}
                      className="font-semibold text-cocoa hover:text-ink-black underline focus-dark"
                    >
                      team on WhatsApp
                    </a>{' '}
                    before ordering.
                  </p>
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs text-cocoa hover:text-ink-black font-semibold underline underline-offset-4"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>View Size Guide & Measurement Table</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Care */}
            <div className="py-3">
              <button
                type="button"
                onClick={() => toggleAccordion(3)}
                aria-expanded={openAccordion === 3}
                className="w-full flex items-center justify-between text-xs uppercase tracking-[0.16em] font-semibold text-ink-black py-2 focus-dark text-left"
              >
                <span>3. Care</span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-taupe transition-transform duration-200 ${
                    openAccordion === 3 ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openAccordion === 3 && (
                <div className="pt-2 pb-3 text-xs leading-relaxed text-ink-black/80 space-y-2">
                  <p><strong>Routine Cleaning:</strong> Wipe with a soft, dry cotton cloth after wear to lift fine dust and street grit. For smudges, dampen slightly with clean water and wipe gently.</p>
                  <p><strong>Moisture Care:</strong> Avoid submersion in standing water. If wet, blot immediately and air-dry away from direct heat or sun.</p>
                  <p><strong>Conditioning:</strong> Apply a thin coat of neutral wax balm or natural beeswax conditioner every 4–6 weeks to maintain grain suppleness.</p>
                  <p><strong>Storage:</strong> Store resting flat on outsoles in a cool, ventilated space.</p>
                </div>
              )}
            </div>

            {/* 4. Shipping & returns */}
            <div className="py-3">
              <button
                type="button"
                onClick={() => toggleAccordion(4)}
                aria-expanded={openAccordion === 4}
                className="w-full flex items-center justify-between text-xs uppercase tracking-[0.16em] font-semibold text-ink-black py-2 focus-dark text-left"
              >
                <span>4. Shipping & returns</span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-taupe transition-transform duration-200 ${
                    openAccordion === 4 ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openAccordion === 4 && (
                <div className="pt-2 pb-3 text-xs leading-relaxed text-ink-black/80 space-y-2">
                  <p><strong>When will it arrive:</strong> {product.shipping_notes}</p>
                  <p>
                    <strong>What happens if it doesn’t work:</strong> Because Drop 001 is a small run of ten pairs, size exchanges are accommodated subject to remaining pairs. Unworn footwear with tags intact and unmarked outsoles may be returned or exchanged within 7 days.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── 6. SOCIAL PROOF (Honest Launch Invite / Day-2 Ready) ── */}
          <div className="pt-4">
            <CustomerProofSection variant="inline-pdp" />
          </div>

          <div className="text-[11px] text-muted-taupe tracking-wider text-center pt-2">
            Leather pams, refined for everyday wear.
          </div>
        </div>
      </div>

      {/* Mobile Sticky Add-to-Bag Bar (Always accessible on mobile without obscuring size errors) */}
      <div
        className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-warm-white/95 backdrop-blur-md border-t border-cocoa/30 px-4 py-3 shadow-lg flex items-center justify-between gap-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
        role="region"
        aria-label="Mobile quick purchase bar"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold text-ink-black truncate">
              {product.name}
            </span>
            <span className="text-xs font-semibold text-cocoa font-mono tabular-nums">
              {formattedPrice}
            </span>
          </div>
          <div className="text-[11px] text-muted-taupe flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
            <span>
              Colour: <span className="font-semibold text-ink-black">{selectedColour}</span>
            </span>
            <span>·</span>
            <span>
              Size:{' '}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('size-selector-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="font-semibold text-ink-black underline underline-offset-2"
              >
                {selectedSize || 'Select Size'}
              </button>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddToBag}
          disabled={buttonState !== 'idle' || (Boolean(selectedSize) && !isSelectedSizeAvailable)}
          aria-label={
            !selectedSize
              ? 'Select a size to add to bag'
              : !isSelectedSizeAvailable
              ? 'Size currently unavailable'
              : `Add ${product.name} (${selectedColour}, size ${selectedSize}) to bag`
          }
          className={`py-3 px-5 text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors min-h-[44px] shrink-0 flex items-center justify-center gap-1.5 focus-dark ${
            !selectedSize
              ? 'bg-ink-black text-warm-white hover:bg-espresso'
              : !isSelectedSizeAvailable
              ? 'bg-bone text-muted-taupe border border-cocoa/20 cursor-not-allowed'
              : buttonState === 'success'
              ? 'bg-cocoa text-warm-white'
              : 'bg-ink-black text-warm-white hover:bg-espresso'
          }`}
        >
          {buttonState === 'loading' && (
            <span className="w-3.5 h-3.5 border-2 border-warm-white border-t-transparent rounded-full animate-spin" />
          )}
          {buttonState === 'success' && <Check className="w-4 h-4" />}
          <span>
            {buttonState === 'loading'
              ? 'Adding...'
              : buttonState === 'success'
              ? 'Added'
              : !selectedSize
              ? 'Select Size'
              : !isSelectedSizeAvailable
              ? 'Unavailable'
              : 'Add to Bag'}
          </span>
        </button>
      </div>

      {/* Dynamic Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        productSizes={product.sizes}
      />

      {/* Schema.org Product Structured Data (Strict single source of truth from product model) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: `NOVEQ ${product.name} Women's Leather Pam, ${product.colour}`,
            sku: product.slug,
            image: product.images.map((img) =>
              img.src.startsWith('http') ? img.src : `https://noveq.com${img.src}`
            ),
            description: product.description,
            brand: {
              '@type': 'Brand',
              name: 'NOVEQ',
            },
            offers: {
              '@type': 'Offer',
              url: `https://noveq.com/shop/${product.slug}`,
              priceCurrency: product.currency,
              price: product.price,
              priceValidUntil: '2027-12-31',
              availability:
                product.stock <= 0
                  ? 'https://schema.org/OutOfStock'
                  : product.stock <= 3
                  ? 'https://schema.org/LimitedAvailability'
                  : 'https://schema.org/InStock',
              itemCondition: 'https://schema.org/NewCondition',
            },
          }),
        }}
      />
    </div>
  );
}
