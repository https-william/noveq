'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { X, UploadCloud, Link2, Sparkles, Star } from 'lucide-react';
import { Product } from '@/types/commerce';

interface AdminProductFormModalProps {
  initialProduct: Product | null;
  isNew: boolean;
  isSaving: boolean;
  isUploading: boolean;
  uploadFeedback: string | null;
  onClose: () => void;
  onSave: (data: Partial<Product>, isNew: boolean) => void;
  onUploadImage: (file: File, onSuccess: (url: string) => void) => void;
}

export function AdminProductFormModal({
  initialProduct,
  isNew,
  isSaving,
  isUploading,
  uploadFeedback,
  onClose,
  onSave,
  onUploadImage,
}: AdminProductFormModalProps) {
  const [name, setName] = useState(initialProduct?.name || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [collection, setCollection] = useState(
    initialProduct?.collection || 'Drop 001'
  );
  const [price, setPrice] = useState(initialProduct?.price || 20000);
  const [comparePrice, setComparePrice] = useState(
    initialProduct?.compare_at_price || 25000
  );
  const [colour, setColour] = useState(initialProduct?.colour || 'Black');
  const [colourHex, setColourHex] = useState(
    initialProduct?.colourHex || '#1A1918'
  );
  const [stock, setStock] = useState(initialProduct?.stock || 11);
  const [description, setDescription] = useState(
    initialProduct?.description ||
      'Handcrafted in Lagos from soft natural leather with cushioned everyday arch support.'
  );
  const [material, setMaterial] = useState(
    initialProduct?.material ||
      'Soft natural Nigerian leather with cushioned underfoot bedding and smooth rounded edges.'
  );
  const [care, setCare] = useState(
    initialProduct?.care ||
      'Wipe with a soft dry cloth after wear and nourish lightly with clear leather balm.'
  );
  const [designNote, setDesignNote] = useState(
    initialProduct?.design_note || ''
  );
  const [hidden, setHidden] = useState(
    initialProduct?.hidden || initialProduct?.publish_status === 'draft' || false
  );
  const [restocking, setRestocking] = useState(
    Boolean(initialProduct?.restocking)
  );
  const [images, setImages] = useState<
    Array<{ src: string; alt: string; viewType: 'hero' | 'detail' | 'side' }>
  >(
    initialProduct?.images?.map((img, idx) => ({
      src: img.src,
      alt: img.alt || `NOVEQ ${initialProduct.name}`,
      viewType:
        (img.viewType as 'hero' | 'detail' | 'side') ||
        (idx === 0 ? 'hero' : 'detail'),
    })) || [
      {
        src: '/images/products/the-weave-black.jpg',
        alt: 'NOVEQ Product Image',
        viewType: 'hero',
      },
    ]
  );
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      alert('Style name and price are required.');
      return;
    }

    onSave(
      {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        collection,
        price: Number(price),
        compare_at_price: comparePrice ? Number(comparePrice) : undefined,
        colour,
        colourHex,
        stock: Number(stock),
        description,
        material,
        care,
        design_note: designNote,
        hidden,
        restocking,
        publish_status: hidden ? 'draft' : 'published',
        images: images.map((i, idx) => ({
          src: i.src,
          alt: i.alt || `NOVEQ ${name}`,
          viewType: idx === 0 ? 'hero' : i.viewType || 'detail',
        })),
      },
      isNew
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onUploadImage(file, (uploadedUrl) => {
      setImages((prev) => [
        {
          src: uploadedUrl,
          alt: `NOVEQ ${name || 'Style'} Image`,
          viewType: 'hero',
        },
        ...prev.map((img) => ({
          ...img,
          viewType: 'detail' as const,
        })),
      ]);
    });

    e.target.value = '';
  };

  const handleAddImageUrl = (urlToAdd?: string) => {
    const targetUrl = (urlToAdd || customImageUrl).trim();
    if (!targetUrl) return;

    setImages((prev) => [
      {
        src: targetUrl,
        alt: `NOVEQ ${name || 'Style'} Image`,
        viewType: prev.length === 0 ? 'hero' : 'detail',
      },
      ...prev,
    ]);
    setCustomImageUrl('');
    setIsUrlInputOpen(false);
  };

  const handleSetHero = (targetIdx: number) => {
    setImages((prev) => {
      if (targetIdx <= 0 || targetIdx >= prev.length) return prev;
      const selected = prev[targetIdx];
      const remainder = prev.filter((_, idx) => idx !== targetIdx);
      return [
        { ...selected, viewType: 'hero' },
        ...remainder.map((img) => ({ ...img, viewType: 'detail' as const })),
      ];
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-warm-white border border-cocoa/30 max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in duration-150">
        <div className="p-4 sm:p-5 border-b border-cocoa/15 bg-bone/70 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-cocoa block">
              Catalog Studio
            </span>
            <h3 className="font-editorial text-xl font-normal text-ink-black">
              {isNew
                ? 'Add Footwear Style'
                : `Edit: ${initialProduct?.name}`}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product form"
            className="p-1 hover:bg-cocoa/10 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5 text-ink-black" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                Style Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. The Knot Slide Pam"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (isNew) {
                    setSlug(
                      e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    );
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl font-semibold text-ink-black min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                URL Slug
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl font-mono text-ink-black min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                Price (₦) *
              </label>
              <input
                type="number"
                min={1000}
                step={500}
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl font-mono font-bold text-ink-black min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                Compare Price (₦)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={comparePrice}
                onChange={(e) => setComparePrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl font-mono text-muted-taupe min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                Total Stock *
              </label>
              <input
                type="number"
                min={0}
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl font-mono font-bold text-ink-black min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                Primary Colour
              </label>
              <input
                type="text"
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl text-ink-black min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                Colour Swatch
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={colourHex}
                  onChange={(e) => setColourHex(e.target.value)}
                  className="w-10 h-10 border border-cocoa/30 rounded-lg p-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={colourHex}
                  onChange={(e) => setColourHex(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl font-mono text-ink-black min-h-[44px]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                Collection
              </label>
              <input
                type="text"
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl text-ink-black min-h-[44px]"
              />
            </div>
          </div>

          {/* Photo Manager */}
          <div className="p-4 bg-bone/60 border border-cocoa/20 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-cocoa">
                  Style Photos (Optimized WebP)
                </label>
                <p className="text-[11px] text-muted-taupe">
                  Photos are resized and saved cleanly when uploaded.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-ink-black hover:bg-espresso text-warm-white text-xs font-semibold rounded-full transition-colors min-h-[38px] cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsUrlInputOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-warm-white hover:bg-bone border border-cocoa/30 text-ink-black text-xs font-semibold rounded-full transition-colors min-h-[38px] cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>{isUrlInputOpen ? 'Hide URL' : 'Paste URL'}</span>
                </button>
              </div>
            </div>

            {isUrlInputOpen && (
              <div className="p-3 bg-warm-white border border-cocoa/30 rounded-xl space-y-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://... or /images/products/..."
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-bone/50 border border-cocoa/30 rounded-xl text-xs text-ink-black min-h-[40px]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddImageUrl()}
                    disabled={!customImageUrl.trim()}
                    className="px-4 py-2 bg-espresso hover:bg-ink-black text-warm-white text-xs font-semibold rounded-full disabled:opacity-40 min-h-[40px] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {uploadFeedback && (
              <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl font-mono flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{uploadFeedback}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {images.map((img, idx) => {
                const isHero = idx === 0 || img.viewType === 'hero';
                return (
                  <div
                    key={idx}
                    className={`relative w-20 h-20 bg-warm-white border rounded-xl overflow-hidden group ${
                      isHero
                        ? 'border-espresso ring-2 ring-espresso/30'
                        : 'border-cocoa/30'
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      unoptimized={
                        img.src.startsWith('data:') || img.src.startsWith('http')
                      }
                      sizes="80px"
                      className="object-cover"
                    />
                    {isHero && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-ink-black/90 text-warm-white text-[9px] uppercase font-bold tracking-wider rounded-full pointer-events-none">
                        Main
                      </span>
                    )}
                    <div className="absolute inset-0 bg-ink-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {!isHero && (
                        <button
                          type="button"
                          onClick={() => handleSetHero(idx)}
                          className="p-1.5 bg-warm-white/95 text-ink-black rounded-full cursor-pointer"
                          title="Make primary photo"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="p-1.5 bg-oxblood text-warm-white rounded-full cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
              Plain Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl text-ink-black"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                Leather &amp; Build
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl text-ink-black min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-cocoa mb-1">
                Care Guidance
              </label>
              <input
                type="text"
                value={care}
                onChange={(e) => setCare(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-bone/60 border border-cocoa/30 rounded-xl text-ink-black min-h-[44px]"
              />
            </div>
          </div>

          {/* Availability & Visibility Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-bone/60 border border-cocoa/20 rounded-xl flex items-center justify-between gap-2">
              <div>
                <div className="font-semibold text-ink-black">
                  Restocking Status
                </div>
                <div className="text-[11px] text-muted-taupe">
                  {restocking
                    ? 'Paused with waitlist email capture'
                    : 'Open for customers to buy'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRestocking(!restocking)}
                className={`px-3 py-1.5 rounded-full font-semibold text-[11px] border cursor-pointer shrink-0 ${
                  restocking
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}
              >
                {restocking ? 'Restocking' : 'Open'}
              </button>
            </div>

            <div className="p-3.5 bg-bone/60 border border-cocoa/20 rounded-xl flex items-center justify-between gap-2">
              <div>
                <div className="font-semibold text-ink-black">
                  Store Visibility
                </div>
                <div className="text-[11px] text-muted-taupe">
                  {hidden ? 'Hidden from store' : 'Visible in store'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHidden(!hidden)}
                className={`px-3 py-1.5 rounded-full font-semibold text-[11px] border cursor-pointer shrink-0 ${
                  hidden
                    ? 'bg-gray-200 text-gray-800 border-gray-300'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}
              >
                {hidden ? 'Hidden' : 'Visible'}
              </button>
            </div>
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
              disabled={isSaving}
              className="flex-1 py-3 bg-ink-black text-warm-white text-xs uppercase tracking-wider font-bold rounded-full hover:bg-espresso transition-colors disabled:opacity-50 min-h-[44px] cursor-pointer"
            >
              {isSaving ? 'Saving...' : isNew ? 'Add Style' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
