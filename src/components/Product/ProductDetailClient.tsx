'use client';

import { useState, useEffect, useRef } from 'react';
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
import { MaisonCharmLoader } from '@/components/ui/MaisonCharmLoader';
import { trackEvent } from '@/lib/analytics';
import { SITE_SETTINGS } from '@/config/siteSettings';
import { formatInternationalSizeLabel, getSizeConversion } from '@/config/sizing';
import { useBlackFriday } from '@/hooks/useBlackFriday';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const { phase, isLive, isPreview, getUnitPrice } = useBlackFriday();

  // Gallery state & touch swipe
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Colour selection state
  const initialColour = product.colours?.[0]?.name || product.colour;
  const [selectedColour, setSelectedColour] = useState<string>(initialColour);

  // Size selection & validation state (starts unselected so customers pick their exact worldwide size)
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [sizeError, setSizeError] = useState<string | null>(null);
  const sizeSelectRef = useRef<HTMLSelectElement>(null);

  // Charm & personalisation state
  const [charmActive, setCharmActive] = useState(
    product.charm_option.enabledByDefault || false
  );
  const [engravedName, setEngravedName] = useState('');

  // Add to bag button states: 'idle' | 'loading' | 'success'
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success'>('idle');

  // Restock alert signup state (for paused/restocking styles)
  const [restockEmail, setRestockEmail] = useState('');
  const [restockStatus, setRestockStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [restockMessage, setRestockMessage] = useState<string | null>(null);

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

  const isRestocking =
    Boolean(product.restocking) ||
    product.stock <= 0 ||
    product.sizes.every((s) => !s.available);
  const selectedSizeObj = product.sizes.find((s) => s.size === selectedSize);
  const isSelectedSizeAvailable = !isRestocking && (selectedSizeObj?.available ?? false);

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockEmail.trim() || restockStatus === 'submitting') return;

    setRestockStatus('submitting');
    setRestockMessage(null);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: restockEmail.trim(),
          source: `restock_${product.slug}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRestockStatus('error');
        setRestockMessage(data.error || 'Please enter a valid email address.');
        return;
      }
      setRestockStatus('success');
      setRestockMessage(`Saved. We will email you as soon as ${product.name} returns.`);
      setRestockEmail('');
    } catch {
      setRestockStatus('error');
      setRestockMessage('Could not save right now. Please try again shortly.');
    }
  };

  const handleAddToBag = () => {
    if (isRestocking || buttonState !== 'idle') return;

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


  const bfUnitPrice = getUnitPrice(product.price);
  const displayPrice = isLive ? bfUnitPrice : product.price;

  const formatNaira = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: product.currency,
      maximumFractionDigits: 0,
    }).format(amount);

  const formattedPrice = formatNaira(displayPrice);
  const formattedRegularPrice = formatNaira(product.price);
  const formattedBfUpcomingPrice = formatNaira(bfUnitPrice);

  const formattedComparePrice = isLive
    ? formattedRegularPrice
    : product.compare_at_price
    ? formatNaira(product.compare_at_price)
    : null;

  const activeImage = product.images[activeImageIndex] || product.images[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16 pb-28 sm:pb-16">
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 lg:gap-16 items-start">
        {/* ── 1. GALLERY SECTION (5-8 images, desktop thumbnail rail, mobile scrollable) ── */}
        <div className="md:col-span-6 lg:col-span-7 md:sticky md:top-28 flex flex-col-reverse lg:flex-row gap-4">
          {/* Desktop Thumbnail Rail / Selector */}
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 shrink-0">
            {product.images.map((img, idx) => (
              <button
                key={`${img.src}-${idx}`}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                aria-label={`View photo ${idx + 1}: ${img.viewType}`}
                aria-current={activeImageIndex === idx}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 bg-bone border rounded-md shrink-0 overflow-hidden transition-[border-color,opacity,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] focus-dark active:scale-[0.96] ${
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
          <div className="relative w-full p-2 sm:p-2.5 bg-bone border border-cocoa/25 rounded-[1.5rem] shadow-apple-md select-none">
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative aspect-square sm:aspect-[4/3] lg:aspect-square w-full bg-espresso/15 border border-cocoa/20 rounded-[calc(1.5rem-0.5rem)] overflow-hidden flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]"
            >
            {/* Pre-rendered Stacked Image Layers for 0ms Instantaneous Switching */}
            {product.images.map((img, idx) => {
              const isActive = activeImageIndex === idx;
              return (
                <div
                  key={`${img.src}-${idx}`}
                  className={`absolute inset-0 transition-opacity duration-150 ease-out ${
                    isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                  aria-hidden={!isActive}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    priority={idx === 0 || idx === 1}
                    loading={idx <= 3 ? 'eager' : 'lazy'}
                    unoptimized={img.src.startsWith('data:')}
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className={`transition-transform duration-300 ${
                      img.src.endsWith('.svg') ? 'object-contain p-6 sm:p-10' : 'object-cover'
                    }`}
                  />
                </div>
              );
            })}

            {/* View Type Indicator Tag */}
            <div className="absolute top-4 left-4 px-3 py-1 bg-warm-white/90 border border-cocoa/25 text-[10px] uppercase tracking-[0.2em] text-cocoa font-medium rounded-full pointer-events-none">
              {activeImage.viewType} View
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
                    className={`w-2 h-2 rounded-full transition-[transform,background-color] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
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
        </div>

        {/* ── 2. ABOVE THE FOLD DETAILS (Zero scrolling required on desktop/tablet) ── */}
        <div className="md:col-span-6 lg:col-span-5 space-y-6">
          {/* Header & Value Statement */}
          <div className="space-y-2 border-b border-cocoa/20 pb-5">
            <div className="flex items-center justify-between text-xs tracking-[0.16em] uppercase text-cocoa font-medium">
              <span>{product.collection}</span>
              {isRestocking ? (
                <span className="px-3 py-1 bg-bone border border-cocoa/25 rounded-full text-[10px] tracking-[0.18em] text-espresso font-semibold">
                  Restocking Soon
                </span>
              ) : (
                <span className="text-muted-taupe">Drop 001 · Available</span>
              )}
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[2.75rem] font-normal tracking-[-0.015em] text-ink-black leading-[1.12]">
              NOVEQ {product.name}
            </h1>

            {/* Price (Never hidden or hover-gated) */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-2xl font-semibold text-ink-black tabular-nums">
                  {formattedPrice}
                </span>
                {formattedComparePrice && (
                  <span className="text-base text-muted-taupe line-through tabular-nums">
                    {formattedComparePrice}
                  </span>
                )}
                {isLive ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#111111] border border-[#b89b72]/45 text-[10px] uppercase tracking-[0.16em] text-[#b89b72] font-semibold">
                    24-Hour Edit · 25% Off{isPreview ? ' · Preview' : ''}
                  </span>
                ) : (
                  <span className="text-xs uppercase tracking-wider text-muted-taupe">
                    Launch Price
                  </span>
                )}
              </div>

              {isLive ? (
                <p className="text-[11px] text-cocoa font-medium">
                  Applies automatically at checkout · Courier delivery fees stay standard rate.
                </p>
              ) : (
                !isRestocking &&
                phase === 'upcoming' && (
                  <div className="p-2.5 px-3 rounded-lg bg-[#111111] border border-[#b89b72]/30 text-[11px] text-[#cecbbe]">
                    <span className="text-[#b89b72] font-semibold">
                      Nov 27 · 24-Hour Edit:
                    </span>{' '}
                    {formattedBfUpcomingPrice} (25% off pair · excludes delivery).
                  </div>
                )
              )}
            </div>

            {/* Concise Value Statement */}
            <p className="text-[15px] sm:text-base text-ink-black/85 font-normal leading-relaxed pt-2">
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
                    className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full border text-xs font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] min-h-[44px] focus-dark active:scale-[0.97] ${
                      isSelected
                        ? 'border-ink-black bg-warm-white text-ink-black shadow-apple-sm font-semibold ring-1 ring-ink-black'
                        : 'border-cocoa/30 bg-bone/40 text-ink-black/80 hover:border-cocoa/60 hover:bg-warm-white'
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
              Handmade in small batches from soft, natural Nigerian leather.
            </p>
          </div>

          {/* Size Selector - Accessible Worldwide Sizing Dropdown */}
          <div id="size-selector-section" className="space-y-3 scroll-mt-28">
            <div className="flex items-center justify-between gap-2 text-xs">
              <label
                htmlFor="product-size-select"
                className="uppercase tracking-[0.16em] text-muted-taupe font-medium"
              >
                Select Size (EU · UK · US)
              </label>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-[11px] text-cocoa hover:text-ink-black font-semibold underline underline-offset-4 inline-flex items-center gap-1 focus-dark min-h-[32px]"
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
                className="p-3 bg-oxblood/10 border border-oxblood/30 text-oxblood text-xs rounded-lg flex items-center gap-2 animate-in fade-in duration-150"
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{sizeError}</span>
              </div>
            )}

            <div className="relative">
              <select
                ref={sizeSelectRef}
                id="product-size-select"
                value={selectedSize}
                disabled={isRestocking}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    handleSelectSize(val);
                  } else {
                    setSelectedSize('');
                  }
                }}
                aria-label="Choose your shoe size"
                className={`w-full appearance-none pl-4 pr-11 py-3.5 text-sm font-medium rounded-xl border transition-[border-color,background-color,box-shadow] duration-[180ms] min-h-[50px] focus:outline-none focus:border-ink-black focus:ring-1 focus:ring-ink-black ${
                  isRestocking
                    ? 'bg-bone/60 text-muted-taupe border-cocoa/20 cursor-not-allowed'
                    : sizeError
                    ? 'bg-warm-white text-ink-black border-oxblood ring-1 ring-oxblood/30 cursor-pointer'
                    : 'bg-warm-white text-ink-black border-cocoa/35 hover:border-ink-black shadow-xs cursor-pointer'
                }`}
              >
                <option value="">
                  {isRestocking
                    ? 'Restocking soon (EU 34 – EU 44)'
                    : 'Choose your size (EU 34 – EU 44)'}
                </option>
                {product.sizes.map((sz) => {
                  const label = formatInternationalSizeLabel(sz.size);
                  const suffix = !sz.available
                    ? isRestocking
                      ? ' — Restocking soon'
                      : ' — Sold out'
                    : '';
                  return (
                    <option
                      key={sz.size}
                      value={sz.size}
                      disabled={!sz.available}
                    >
                      {label}
                      {suffix}
                    </option>
                  );
                })}
              </select>
              <ChevronDown
                className="pointer-events-none w-4 h-4 text-cocoa absolute right-4 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>

            {selectedSize && getSizeConversion(selectedSize) ? (
              <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-bone/70 border border-cocoa/15 rounded-lg text-[11px] text-ink-black/80">
                <span>
                  Selected: <strong className="text-ink-black">{selectedSize}</strong> ({getSizeConversion(selectedSize)!.uk} · {getSizeConversion(selectedSize)!.us})
                </span>
                <span className="text-muted-taupe tabular-nums">
                  Foot length ~{getSizeConversion(selectedSize)!.cm}
                </span>
              </div>
            ) : (
              !isRestocking && (
                <p className="text-[11px] text-muted-taupe leading-relaxed">
                  Made to order across worldwide women&apos;s sizes EU 34 to EU 44 (UK 1.5–10 / US 4–12).
                </p>
              )
            )}
          </div>

          {/* Real Stock Signal */}
          <div className="flex items-center gap-2 text-xs text-muted-taupe">
            <span
              className={`w-1.5 h-1.5 rounded-full ${isRestocking ? 'bg-muted-taupe/60' : 'bg-cocoa'}`}
              aria-hidden="true"
            />
            {isRestocking ? (
              <span>
                Currently restocking with our shoemaker in Lagos. Join the restock alert below for first access.
              </span>
            ) : (
              <span>
                Initial release: <span className="font-semibold text-ink-black">{product.stock} pairs</span> crafted for Drop 001.
              </span>
            )}
          </div>

          {/* ── 3. CHARM / PERSONALISATION (Only on products that support it) ── */}
          {product.charm_option.supported && (
            <div className="p-4 sm:p-6 bg-warm-white border border-cocoa/20 rounded-xl space-y-4 shadow-apple-sm">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="charm-active-checkbox" className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    id="charm-active-checkbox"
                    type="checkbox"
                    checked={charmActive}
                    onChange={(e) => setCharmActive(e.target.checked)}
                    className="w-4 h-4 accent-espresso rounded-sm"
                  />
                  <div className="flex items-center gap-2 text-sm font-medium text-ink-black">
                    <Heart className="w-4 h-4 fill-oxblood text-oxblood" />
                    <span>Heart charm (+ Personalisation)</span>
                  </div>
                </label>
                <span className="text-xs uppercase tracking-wider text-cocoa font-medium px-3 py-1 bg-bone rounded-full shrink-0">
                  Bespoke
                </span>
              </div>

              {charmActive && product.charm_option.supportsEngraving && (
                <div className="pt-3 border-t border-cocoa/15 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-taupe">
                    <label htmlFor="engraved-name-input">Add a name / initials:</label>
                    <span id="charm-char-count" className="tabular-nums">
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
                    className="w-full px-4 py-2.5 bg-warm-white border border-cocoa/30 text-ink-black text-xs uppercase tracking-widest focus:outline-none focus:border-ink-black rounded-lg"
                  />
                </div>
              )}
            </div>
          )}

          {/* Add to Bag Button / Restocking Soon State */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleAddToBag}
              disabled={isRestocking || buttonState !== 'idle' || (Boolean(selectedSize) && !isSelectedSizeAvailable)}
              aria-label={
                isRestocking
                  ? `${product.name} is currently restocking soon`
                  : selectedSize && !isSelectedSizeAvailable
                  ? 'Size currently unavailable'
                  : !selectedSize
                  ? 'Select a size to add to bag'
                  : `Add ${product.name} to bag - ${formattedPrice}`
              }
              className={`w-full py-4 px-8 text-xs uppercase tracking-[0.2em] font-semibold rounded-full transition-[background-color,border-color,color,box-shadow,transform] duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] min-h-[52px] flex items-center justify-center gap-2 focus-dark ${
                isRestocking || (selectedSize && !isSelectedSizeAvailable)
                  ? 'bg-bone text-muted-taupe border border-cocoa/25 cursor-not-allowed shadow-none'
                  : buttonState === 'success'
                  ? 'bg-cocoa text-warm-white border border-cocoa shadow-apple-md cursor-pointer'
                  : 'bg-ink-black text-warm-white hover:bg-espresso border border-ink-black shadow-apple-md hover:shadow-apple-lg active:scale-[0.97] cursor-pointer'
              }`}
            >
              {buttonState === 'loading' && (
                <span className="inline-flex items-center gap-2.5">
                  <MaisonCharmLoader size="xs" tone="light" />
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
                  {isRestocking
                    ? 'Restocking Soon'
                    : !selectedSize
                    ? 'Select a Size'
                    : !isSelectedSizeAvailable
                    ? 'Size Unavailable'
                    : `Add to Bag - ${formattedPrice}`}
                </span>
              )}
            </button>

            {isRestocking ? (
              <div
                id="restock-notify"
                className="p-4 sm:p-5 bg-warm-white border border-cocoa/20 rounded-xl space-y-3 shadow-xs"
              >
                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-cocoa font-semibold block">
                    Restock Notification
                  </span>
                  <p className="text-xs text-muted-taupe leading-relaxed">
                    Leave your email to hear the moment {product.name} is back from the workshop, or explore The Weave which is open for orders today.
                  </p>
                </div>

                {restockStatus === 'success' ? (
                  <p className="text-xs font-medium text-espresso py-1">{restockMessage}</p>
                ) : (
                  <form onSubmit={handleRestockSubmit} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      required
                      value={restockEmail}
                      onChange={(e) => setRestockEmail(e.target.value)}
                      placeholder="you@example.com"
                      aria-label={`Email address for ${product.name} restock alert`}
                      className="flex-1 px-3.5 py-2.5 bg-bone/50 border border-cocoa/30 rounded-lg text-xs text-ink-black placeholder:text-muted-taupe/70 focus:outline-none focus:border-ink-black"
                    />
                    <button
                      type="submit"
                      disabled={restockStatus === 'submitting'}
                      className="px-5 py-2.5 bg-espresso hover:bg-ink-black text-warm-white text-[11px] uppercase tracking-[0.16em] font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {restockStatus === 'submitting' ? 'Saving...' : 'Notify Me'}
                    </button>
                  </form>
                )}

                {restockStatus === 'error' && restockMessage && (
                  <p className="text-xs text-oxblood">{restockMessage}</p>
                )}

                <div className="pt-1 border-t border-cocoa/10 flex items-center justify-between text-xs">
                  <span className="text-muted-taupe">Available to order today:</span>
                  <Link
                    href="/shop/the-weave-slide-pam"
                    className="font-semibold text-ink-black hover:text-espresso underline underline-offset-4"
                  >
                    Shop The Weave Slide Pam
                  </Link>
                </div>
              </div>
            ) : (
              /* Delivery Note (One Line) */
              <div className="flex items-center justify-center gap-2 text-xs text-muted-taupe">
                <Truck className="w-3.5 h-3.5 text-cocoa" aria-hidden="true" />
                <span>7 business days nationwide delivery (5 days benchcraft + 2 days tracked courier)</span>
              </div>
            )}
          </div>

          {/* ── 4. CRAFT & MATERIAL ASSURANCE ── */}
          <div className="p-4 sm:p-5 bg-warm-white border border-cocoa/15 rounded-xl flex items-start gap-3 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-cocoa shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm leading-relaxed text-ink-black/85">
              <span className="font-semibold block uppercase tracking-wider text-xs text-cocoa mb-1">
                Checked by Hand in Lagos
              </span>
              Cut and stitched from soft Nigerian leather with gently cushioned arch support. Individually checked pair-by-pair in our Lagos studio before dispatch.
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
                <div className="pt-2 pb-3 text-sm leading-relaxed text-ink-black/80 space-y-2">
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
                <div className="pt-2 pb-3 text-sm leading-relaxed text-ink-black/80 space-y-3">
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
                <div className="pt-2 pb-3 text-xs leading-relaxed text-ink-black/80 space-y-2.5">
                  <p><strong>After Wear:</strong> Wipe with a soft, dry cloth to brush away fine dust and city grit. For small marks, blot gently with a slightly damp cloth.</p>
                  <p><strong>Rainy Days:</strong> Avoid standing puddles. If wet, pat dry right away with a clean towel and let air-dry indoors in shade away from sun or direct heat.</p>
                  <p><strong>Conditioning:</strong> Every 4–6 weeks, rub in a drop of plain leather cream to keep straps soft and comfortable.</p>
                  <p><strong>Storage:</strong> Rest pairs flat inside their cotton dust bag out of direct sunlight.</p>
                  <p className="pt-1">
                    <Link href="/care" className="font-semibold text-cocoa hover:text-ink-black underline underline-offset-4">
                      Read our full Leather Care Guide
                    </Link>
                  </p>
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
                  <p><strong>When will it arrive:</strong> Every pair is made to order in Lagos. Hand-finishing takes 5 business days, followed by 2 business days for tracked courier delivery (7 business days nationwide).</p>
                  <p>
                    <strong>What happens if it doesn’t work:</strong> Because Drop 001 is a small run of ten pairs, size exchanges are accommodated whenever sizes remain. Unworn pairs with tags intact and clean soles may be returned or exchanged within 7 days.
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
                  setTimeout(() => sizeSelectRef.current?.focus(), 250);
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
          disabled={isRestocking || buttonState !== 'idle' || (Boolean(selectedSize) && !isSelectedSizeAvailable)}
          aria-label={
            isRestocking
              ? `${product.name} is currently restocking soon`
              : !selectedSize
              ? 'Select a size to add to bag'
              : !isSelectedSizeAvailable
              ? 'Size currently unavailable'
              : `Add ${product.name} (${selectedColour}, size ${selectedSize}) to bag`
          }
          className={`py-3 px-6 text-xs uppercase tracking-wider font-semibold rounded-full transition-[background-color,color,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] min-h-[44px] shrink-0 flex items-center justify-center gap-1.5 focus-dark active:scale-[0.97] shadow-apple-sm ${
            isRestocking
              ? 'bg-bone text-muted-taupe border border-cocoa/25 cursor-not-allowed'
              : !selectedSize
              ? 'bg-ink-black text-warm-white hover:bg-espresso'
              : !isSelectedSizeAvailable
              ? 'bg-bone text-muted-taupe border border-cocoa/20 cursor-not-allowed'
              : buttonState === 'success'
              ? 'bg-cocoa text-warm-white'
              : 'bg-ink-black text-warm-white hover:bg-espresso'
          }`}
        >
          {buttonState === 'loading' && <MaisonCharmLoader size="xs" tone="light" />}
          {buttonState === 'success' && <Check className="w-4 h-4" />}
          <span>
            {isRestocking
              ? 'Restocking Soon'
              : buttonState === 'loading'
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

      {/* Schema.org Product Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: `NOVEQ ${product.name} - Nigerian Female Leather Pam (${product.colour})`,
            sku: product.slug,
            image: product.images.map((img) =>
              img.src.startsWith('http') ? img.src : `https://www.noveq.com.ng${img.src}`
            ),
            description: `${product.description} Handcrafted in Lagos, Nigeria from soft natural leather.`,
            category: "Apparel & Accessories > Shoes > Slip-ons & Slides",
            countryOfOrigin: "NG",
            brand: {
              '@type': 'Brand',
              name: 'NOVEQ',
              url: 'https://www.noveq.com.ng',
            },
            offers: {
              '@type': 'Offer',
              url: `https://www.noveq.com.ng/shop/${product.slug}`,
              priceCurrency: product.currency,
              price: product.price,
              priceValidUntil: '2027-12-31',
              availability:
                isRestocking
                  ? 'https://schema.org/OutOfStock'
                  : product.stock <= 3
                  ? 'https://schema.org/LimitedAvailability'
                  : 'https://schema.org/InStock',
              itemCondition: 'https://schema.org/NewCondition',
              seller: {
                '@type': 'Organization',
                name: 'NOVEQ',
                url: 'https://www.noveq.com.ng',
              },
            },
          }),
        }}
      />
    </div>
  );
}
