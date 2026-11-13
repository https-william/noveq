'use client';

import React, { useId } from 'react';

interface MaisonLoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  tone?: 'dark' | 'light';
  label?: string;
  className?: string;
}

const SIZE_MAP = {
  xs: { width: 22, height: 14 },
  sm: { width: 32, height: 20 },
  md: { width: 54, height: 34 },
  lg: { width: 84, height: 50 },
} as const;

const UNDER_RIBBON_PATH = 'M 11 24 C 11 9.5, 28 9.5, 40 24 C 52 38.5, 69 38.5, 69 24';
const OVER_RIBBON_PATH = 'M 69 24 C 69 9.5, 52 9.5, 40 24 C 28 38.5, 11 38.5, 11 24';
const FULL_LOOP_PATH = `${UNDER_RIBBON_PATH} ${OVER_RIBBON_PATH.replace('M 69 24 ', '')}`;
const INNER_EDGE_PATH = 'M 65.5 24 C 65.5 13.5, 51.5 13.5, 40 24 C 28.5 34.5, 14.5 34.5, 14.5 24';

export function MaisonRibbonLoader({
  size = 'md',
  tone = 'dark',
  label,
  className = '',
}: MaisonLoaderProps) {
  const rawMaskId = useId();
  const maskId = `nvq-ribbon-weave-${rawMaskId.replace(/:/g, '')}`;
  const dimensions = SIZE_MAP[size];
  const isLight = tone === 'light';
  const isCompact = size === 'xs' || size === 'sm';

  const primaryStroke = isLight ? '#FAF8F4' : '#2A1B15';
  const underStroke = isLight ? '#CECBBE' : '#5B4033';
  const sheenStroke = isLight ? '#FFFFFF' : '#B89B72';
  const strokeWidth = size === 'xs' ? 3 : size === 'sm' ? 2.4 : 1.75;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label || 'Loading'}
      className={`inline-flex flex-col items-center justify-center select-none ${className}`}
    >
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 80 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="overflow-visible shrink-0"
      >
        <defs>
          <mask id={maskId}>
            <rect width="80" height="48" fill="white" />
            <path
              d="M 45.2 18.4 L 34.8 29.6"
              stroke="black"
              strokeWidth={size === 'xs' ? 8 : 6.2}
              strokeLinecap="round"
            />
          </mask>
        </defs>

        <g className="animate-ribbon-twist">
          {/* Under-Fold Leather Strand (masked at center weave) */}
          <path
            d={UNDER_RIBBON_PATH}
            stroke={underStroke}
            strokeOpacity="0.48"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            mask={`url(#${maskId})`}
          />

          {/* Over-Fold Leather Strand */}
          <path
            d={OVER_RIBBON_PATH}
            stroke={primaryStroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Subtle Inner Edge Contour for Supple Calfskin Depth */}
          {!isCompact && (
            <path
              d={INNER_EDGE_PATH}
              stroke={underStroke}
              strokeOpacity="0.28"
              strokeWidth="0.85"
              strokeLinecap="round"
            />
          )}

          {/* Gliding Satin Sheen Along the Twisted Contour */}
          <path
            d={FULL_LOOP_PATH}
            stroke={sheenStroke}
            strokeOpacity="0.68"
            strokeWidth={strokeWidth * 0.72}
            strokeLinecap="round"
            strokeDasharray="24 124"
            className="animate-ribbon-sheen"
          />
        </g>
      </svg>

      {label ? (
        <span
          className={`mt-3 text-xs uppercase tracking-[0.22em] font-medium ${
            isLight ? 'text-warm-white/85' : 'text-cocoa'
          }`}
        >
          {label}
        </span>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
}

export const MaisonCharmLoader = MaisonRibbonLoader;
