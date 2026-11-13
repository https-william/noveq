'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

/**
 * ScrollReveal Component
 * 
 * Provides subtle opacity/transform reveal on scroll.
 * Strictly respects prefers-reduced-motion (instant reveal).
 * Uses lightweight IntersectionObserver with zero layout shift.
 */
export function ScrollReveal({
  children,
  className = '',
  delayMs = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // If reduced motion is requested or in SSR, reveal immediately without animation
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delayMs > 0) {
              const timer = setTimeout(() => setIsRevealed(true), delayMs);
              return () => clearTimeout(timer);
            } else {
              setIsRevealed(true);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delayMs]);

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-[420ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      } ${className}`}
    >
      {children}
    </div>
  );
}
