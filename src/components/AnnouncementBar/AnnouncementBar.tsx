'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AnnouncementBarProps {
  message?: string;
  linkText?: string;
  linkHref?: string;
  isDismissible?: boolean;
}

export default function AnnouncementBar({
  message = 'DROP 001 IS LIVE — LIMITED RUN OF LEATHER PAMS',
  linkText,
  linkHref,
  isDismissible = true,
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Announcement"
      className="relative z-50 bg-espresso text-warm-white border-b border-cocoa/30 text-[10px] sm:text-xs tracking-[0.14em] sm:tracking-[0.16em] uppercase transition-opacity duration-200"
    >
      <div className="max-w-7xl mx-auto px-8 sm:px-12 py-2 sm:py-2.5 flex items-center justify-center text-center min-h-[36px]">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 font-medium leading-normal">
          <span>{message}</span>
          {linkText && linkHref && (
            <a
              href={linkHref}
              className="underline underline-offset-4 hover:text-bone transition-colors focus-dark shrink-0 font-semibold text-warm-white"
            >
              {linkText}
            </a>
          )}
        </div>

        {isDismissible && (
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            aria-label="Dismiss announcement"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 text-muted-taupe hover:text-warm-white transition-colors focus-dark rounded-xs inline-flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </aside>
  );
}
