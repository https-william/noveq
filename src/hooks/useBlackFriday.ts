'use client';

import { useEffect, useState } from 'react';
import {
  BLACK_FRIDAY_DISCOUNT_RATE,
  CountdownParts,
  getBlackFridayState,
  getBlackFridayUnitPrice,
  getCountdownParts,
  BlackFridayState,
} from '@/config/blackFriday';

export interface UseBlackFridayResult extends BlackFridayState {
  mounted: boolean;
  countdown: CountdownParts;
  getUnitPrice: (regularPrice: number) => number;
}

const STATIC_INITIAL_STATE = getBlackFridayState(new Date('2026-11-13T12:00:00+01:00'));

export function useBlackFriday(): UseBlackFridayResult {
  const [mounted, setMounted] = useState(false);
  const [previewOverride, setPreviewOverride] = useState(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.parse('2026-11-13T12:00:00+01:00'));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasPreviewParam = params.get('bf') === 'preview';
    if (hasPreviewParam) {
      sessionStorage.setItem('noveq_bf_preview', '1');
    } else if (params.get('bf') === 'reset') {
      sessionStorage.removeItem('noveq_bf_preview');
    }

    const storedPreview = sessionStorage.getItem('noveq_bf_preview') === '1';
    setPreviewOverride(hasPreviewParam || storedPreview);
    setNowMs(Date.now());
    setMounted(true);

    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const state = mounted
    ? getBlackFridayState(new Date(nowMs), { previewOverride })
    : STATIC_INITIAL_STATE;

  const countdown = mounted
    ? getCountdownParts(state.targetMs, nowMs)
    : getCountdownParts(state.targetMs, Date.parse('2026-11-13T12:00:00+01:00'));

  return {
    ...state,
    mounted,
    countdown,
    discountRate: BLACK_FRIDAY_DISCOUNT_RATE,
    getUnitPrice: getBlackFridayUnitPrice,
  };
}
