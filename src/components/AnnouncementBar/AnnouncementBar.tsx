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
  message = 'DROP 001 IS LIVE — WOMEN’S LEATHER PAMS IN LIMITED RUN',
  linkText,
  linkHref,
  isDismissible = true,
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Announcement"
      className="relative z-50 bg-espresso text-warm-white border-b border-cocoa/30 text-xs tracking-[0.16em] uppercase transition-opacity duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-center text-center min-h-[38px]">
        <div className="flex items-center gap-2 font-medium">
          <span>{message}</span>
          {linkText && linkHref && (
            <a
              href={linkHref}
              className="underline underline-offset-4 hover:text-bone transition-colors focus-dark"
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
            className="absolute right-3 sm:right-6 p-1 text-muted-taupe hover:text-warm-white transition-colors focus-dark rounded-sm inline-flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </aside>
  );
}
