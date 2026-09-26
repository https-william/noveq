'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const executeSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    // Instrument search analytics event
    trackEvent('search', {
      search_term: trimmed,
    });

    onClose();
    router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRef.current) {
      executeSearch(inputRef.current.value);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search catalog"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-ink-black/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl bg-espresso border border-cocoa/40 p-6 rounded-sm shadow-2xl relative text-warm-white">
        <div className="flex items-center justify-between pb-4 border-b border-cocoa/30 mb-6">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-taupe-on-dark">Search NOVEQ</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search dialog"
            className="p-2 text-muted-taupe-on-dark hover:text-warm-white transition-colors focus-dark rounded-sm min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative flex items-center">
          <label htmlFor="catalog-search-input" className="sr-only">
            Search footwear, pams, materials
          </label>
          <Search className="w-5 h-5 text-muted-taupe-on-dark absolute left-3 pointer-events-none" aria-hidden="true" />
          <input
            id="catalog-search-input"
            ref={inputRef}
            type="search"
            name="q"
            placeholder="Search footwear, pams, materials..."
            className="w-full pl-11 pr-4 py-3 bg-ink-black/60 border border-cocoa/40 text-warm-white placeholder:text-muted-taupe-on-dark/70 text-sm focus:outline-none focus:border-warm-white transition-colors rounded-sm"
          />
        </form>

        <div className="mt-6 pt-4 border-t border-cocoa/20">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-taupe-on-dark mb-2">Suggested</p>
          <div className="flex flex-wrap gap-2">
            {['Drop 001', 'The Cut', 'Leather Pams', 'Espresso', 'Craft Story'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => executeSearch(tag)}
                className="text-xs px-2.5 py-1 bg-ink-black/40 border border-cocoa/30 text-warm-white/80 hover:text-warm-white hover:border-cocoa/60 transition-colors rounded-xs focus-dark"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
