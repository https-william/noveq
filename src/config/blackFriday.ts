export const BLACK_FRIDAY_START_ISO = '2026-11-27T00:00:00+01:00';
export const BLACK_FRIDAY_END_ISO = '2026-11-28T00:00:00+01:00';
export const BLACK_FRIDAY_DISCOUNT_RATE = 0.25;
export const BLACK_FRIDAY_DISCOUNT_LABEL = '24-Hour Black Friday Edit (25% Off Pairs)';

export type BlackFridayPhase = 'upcoming' | 'live' | 'ended';

export interface BlackFridayState {
  phase: BlackFridayPhase;
  /** True only when live pricing actually applies (or previewed in UI with explicit preview flag). */
  isLive: boolean;
  /** True when the owner is previewing the live experience via ?bf=preview outside Nov 27. */
  isPreview: boolean;
  /** Target timestamp (ms) for active countdown: start when upcoming, end when live. */
  targetMs: number;
  discountRate: number;
}

export interface CountdownParts {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  totalSeconds: number;
}

export interface BlackFridayOrderTotals {
  phase: BlackFridayPhase;
  isLive: boolean;
  originalSubtotal: number;
  discountAmount: number;
  finalSubtotal: number;
  deliveryFee: number;
  total: number;
  discountLabel?: string;
}

export function getBlackFridayBounds() {
  return {
    startMs: Date.parse(BLACK_FRIDAY_START_ISO),
    endMs: Date.parse(BLACK_FRIDAY_END_ISO),
  };
}

/**
 * Evaluates the Black Friday event phase cleanly in WAT (UTC+1).
 * Server checkouts must NEVER pass `previewOverride: true` from public params —
 * server math may only inspect real time or private server env `BLACK_FRIDAY_FORCE_STATE`.
 */
export function getBlackFridayState(
  now: Date = new Date(),
  options?: {
    previewOverride?: boolean;
    forceServerState?: BlackFridayPhase;
  }
): BlackFridayState {
  const { startMs, endMs } = getBlackFridayBounds();
  const nowMs = now.getTime();

  let phase: BlackFridayPhase;
  if (options?.forceServerState) {
    phase = options.forceServerState;
  } else if (nowMs < startMs) {
    phase = 'upcoming';
  } else if (nowMs < endMs) {
    phase = 'live';
  } else {
    phase = 'ended';
  }

  const isPreview = Boolean(options?.previewOverride && phase !== 'live');
  const effectiveLive = phase === 'live' || isPreview;
  const targetMs = phase === 'upcoming' ? startMs : endMs;

  return {
    phase,
    isLive: effectiveLive,
    isPreview,
    targetMs,
    discountRate: BLACK_FRIDAY_DISCOUNT_RATE,
  };
}

export function getBlackFridayUnitPrice(regularPrice: number): number {
  return Math.round(regularPrice * (1 - BLACK_FRIDAY_DISCOUNT_RATE));
}

export function calculateBlackFridayOrderTotals(params: {
  itemsSubtotal: number;
  deliveryFee: number;
  now?: Date;
  previewOverride?: boolean;
  forceServerState?: BlackFridayPhase;
}): BlackFridayOrderTotals {
  const { itemsSubtotal, deliveryFee, now = new Date(), previewOverride, forceServerState } = params;
  const state = getBlackFridayState(now, { previewOverride, forceServerState });

  const discountAmount = state.isLive
    ? Math.round(itemsSubtotal * BLACK_FRIDAY_DISCOUNT_RATE)
    : 0;

  const finalSubtotal = Math.max(0, itemsSubtotal - discountAmount);
  // Delivery fees are strictly excluded from the 25% discount.
  const total = finalSubtotal + deliveryFee;

  return {
    phase: state.phase,
    isLive: state.isLive,
    originalSubtotal: itemsSubtotal,
    discountAmount,
    finalSubtotal,
    deliveryFee,
    total,
    discountLabel: state.isLive ? BLACK_FRIDAY_DISCOUNT_LABEL : undefined,
  };
}

export function getCountdownParts(targetMs: number, nowMs: number = Date.now()): CountdownParts {
  const diffMs = Math.max(0, targetMs - nowMs);
  const totalSeconds = Math.floor(diffMs / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  return {
    days: pad(days),
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
    totalSeconds,
  };
}

/**
 * Generates and downloads an .ics calendar file for November 27, 2026 (00:00-23:59 WAT).
 * UTC equivalents: 2026-11-26T23:00:00Z to 2026-11-27T22:59:59Z.
 */
export function downloadBlackFridayCalendarInvite(): void {
  if (typeof window === 'undefined') return;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NOVEQ//The 24-Hour Edit//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:noveq-24hr-edit-2026-11-27@noveq.com.ng',
    'DTSTAMP:20261113T120000Z',
    'DTSTART:20261126T230000Z',
    'DTEND:20261127T225959Z',
    'SUMMARY:NOVEQ · The 24-Hour Edit (25% Off All Pairs)',
    'DESCRIPTION:For 24 hours on Friday November 27 (WAT), enjoy 25% off every NOVEQ pair automatically at checkout. Standard delivery rates still apply. Visit https://noveq.com.ng/shop',
    'LOCATION:https://noveq.com.ng/shop',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:NOVEQ 24-Hour Edit opens in 15 minutes (25% off all pairs).',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'NOVEQ-Nov-27-24Hour-Edit.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
