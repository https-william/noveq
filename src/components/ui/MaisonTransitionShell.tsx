'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { MaisonRibbonLoader } from '@/components/ui/MaisonCharmLoader';

const ARRIVAL_STORAGE_KEY = 'nvq_arrived';
const ARRIVAL_MIN_MS = 1050;
const ARRIVAL_MAX_MS = 2200;
const ARRIVAL_EXIT_MS = 740;
const OVERLAY_DELAY_MS = 200;
const STALL_TIMEOUT_MS = 8000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function MaisonArrivalCurtain() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.nvqArrival !== 'pending') {
      return;
    }

    let cancelled = false;
    let exitTimer: number | undefined;

    const fontsReady =
      typeof document !== 'undefined' && document.fonts?.ready
        ? document.fonts.ready.catch(() => undefined)
        : Promise.resolve();

    Promise.race([Promise.all([fontsReady, delay(ARRIVAL_MIN_MS)]), delay(ARRIVAL_MAX_MS)]).then(
      () => {
        if (cancelled) return;

        try {
          sessionStorage.setItem(ARRIVAL_STORAGE_KEY, '1');
        } catch {
          // Ignore private browsing storage restrictions
        }

        root.dataset.nvqArrival = 'exiting';
        exitTimer = window.setTimeout(() => {
          if (!cancelled) {
            delete root.dataset.nvqArrival;
          }
        }, ARRIVAL_EXIT_MS);
      }
    );

    return () => {
      cancelled = true;
      if (exitTimer !== undefined) {
        window.clearTimeout(exitTimer);
      }
    };
  }, []);

  return (
    <div
      id="nvq-arrival-curtain"
      role="status"
      aria-live="polite"
      aria-label="Entering NOVEQ Maison"
      className="fixed inset-0 z-[90] flex-col items-center justify-center bg-bone text-ink-black border-b border-espresso/15 shadow-apple-xl select-none"
    >
      <div className="nvq-curtain-emblem flex flex-col items-center">
        <MaisonRibbonLoader size="lg" tone="dark" />
        <span className="mt-5 font-editorial text-[22px] tracking-[0.28em] pl-[0.28em] text-ink-black lowercase">
          noveq
        </span>
      </div>
    </div>
  );
}

function MaisonRouteTransitionBridge() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams?.toString() ?? '';
  const routeKey = searchString ? `${pathname}?${searchString}` : pathname;

  const [isNavigating, setIsNavigating] = useState(false);
  const [showCharmOverlay, setShowCharmOverlay] = useState(false);
  const [isStalled, setIsStalled] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const pathnameRef = useRef(pathname);
  const routeKeyRef = useRef(routeKey);
  const overlayTimerRef = useRef<number | null>(null);
  const stallTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (overlayTimerRef.current !== null) {
      window.clearTimeout(overlayTimerRef.current);
      overlayTimerRef.current = null;
    }
    if (stallTimerRef.current !== null) {
      window.clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  }, []);

  const clearNavigation = useCallback(() => {
    clearTimers();
    setIsNavigating(false);
    setShowCharmOverlay(false);
    setIsStalled(false);
  }, [clearTimers]);

  const beginNavigation = useCallback(() => {
    clearTimers();
    setIsNavigating(true);
    setIsStalled(false);

    overlayTimerRef.current = window.setTimeout(() => {
      setShowCharmOverlay(true);
    }, OVERLAY_DELAY_MS);

    stallTimerRef.current = window.setTimeout(() => {
      setShowCharmOverlay(true);
      setIsStalled(true);
    }, STALL_TIMEOUT_MS);
  }, [clearTimers]);

  // Finish active navigation state and ensure new pages start cleanly at the top
  useEffect(() => {
    const didPathnameChange = pathnameRef.current !== pathname;
    pathnameRef.current = pathname;
    routeKeyRef.current = routeKey;
    clearNavigation();

    if (didPathnameChange && typeof window !== 'undefined' && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      const rafId = window.requestAnimationFrame(() => {
        if (!window.location.hash) {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
      });
      return () => window.cancelAnimationFrame(rafId);
    }
  }, [pathname, routeKey, clearNavigation]);

  // Listen for internal same-origin link clicks & network connectivity changes
  useEffect(() => {
    setIsOffline(typeof navigator !== 'undefined' && navigator.onLine === false);

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    const handleDocumentClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;
      if (anchor.hasAttribute('download') || anchor.dataset.noTransition === 'true') return;
      if (anchor.target && anchor.target !== '_self') return;

      const rawHref = anchor.getAttribute('href');
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
        return;
      }

      try {
        const nextUrl = new URL(anchor.href, window.location.href);
        if (nextUrl.origin !== window.location.origin) return;

        const nextKey = nextUrl.search ? `${nextUrl.pathname}${nextUrl.search}` : nextUrl.pathname;
        if (nextKey === routeKeyRef.current) return;

        beginNavigation();
      } catch {
        // Ignore malformed URLs
      }
    };

    const handleHashChange = () => clearNavigation();

    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      clearTimers();
      document.removeEventListener('click', handleDocumentClick);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [beginNavigation, clearNavigation, clearTimers]);

  return (
    <>
      {/* Immediate top 2px champagne hairline bar during route navigation */}
      {isNavigating && (
        <div
          aria-hidden="true"
          className="fixed top-0 inset-x-0 z-[85] h-[2px] bg-transparent overflow-hidden pointer-events-none"
        >
          <div className="nvq-nav-progress h-full bg-noveq-brass" />
        </div>
      )}

      {/* Calm translucent Twisting Ribbon overlay after 200ms threshold for slower loads */}
      {isNavigating && showCharmOverlay && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-bone/90 backdrop-blur-sm text-ink-black px-6 text-center"
        >
          <MaisonRibbonLoader size="md" tone="dark" label={isStalled ? undefined : 'Preparing'} />
          {isStalled && (
            <div className="mt-5 flex flex-col items-center gap-3">
              <p className="text-[12px] tracking-[0.06em] text-espresso">
                Connection taking longer than expected
              </p>
              <button
                type="button"
                onClick={clearNavigation}
                className="text-[11px] uppercase tracking-[0.18em] text-ink-black underline underline-offset-4 hover:text-espresso transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {/* Unobtrusive offline banner */}
      {isOffline && (
        <div
          role="status"
          aria-live="assertive"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[95] bg-ink-black text-warm-white border border-warm-white/15 px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] whitespace-nowrap shadow-sm"
        >
          Connection paused · Reconnect to continue
        </div>
      )}
    </>
  );
}

export function MaisonTransitionShell() {
  return (
    <>
      <MaisonArrivalCurtain />
      <Suspense fallback={null}>
        <MaisonRouteTransitionBridge />
      </Suspense>
    </>
  );
}
